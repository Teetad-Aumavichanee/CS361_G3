# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "boto3>=1.28.0",
#     "Flask>=2.3.0",
#     "pymongo>=4.3.0",
#     "dnspython>=2.3.0",
#     "flask-cors>=3.0.10",
#     "python-dotenv>=1.0.0",
# ]
# ///

"""Automated step-by-step deployment script for AWS Learner Lab.

Usage:
    uv run aws_deploy/deploy.py
"""

import os
import sys
import json
import time
import shutil
import zipfile
import subprocess
from pathlib import Path

# Try importing boto3, requests, dotenv
try:
    import boto3
    from botocore.exceptions import ClientError
except ImportError:
    print("Error: boto3 is required. Please install with: uv add boto3")
    sys.exit(1)

PROJECT_ROOT = Path(__file__).resolve().parent.parent


def print_banner(title):
    print("\n" + "=" * 65)
    print(f"🚀  {title}")
    print("=" * 65)


def print_step(step_num, title):
    print(f"\n[Step {step_num}] {title}")
    print("-" * 50)


def load_env_file():
    env_path = PROJECT_ROOT / ".env"
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def get_aws_credentials_and_session():
    load_env_file()
    region = os.getenv("AWS_DEFAULT_REGION") or os.getenv("AWS_REGION") or "us-east-1"
    session = boto3.Session(region_name=region)
    sts = session.client("sts")

    try:
        identity = sts.get_caller_identity()
        account_id = identity["Account"]
        print(f"✅ AWS Connected successfully!")
        print(f"   - Account ID : {account_id}")
        print(f"   - User / ARN : {identity['Arn']}")
        print(f"   - Region     : {region}")
        return session, account_id, region
    except Exception as e:
        print("\n❌ AWS Authentication failed!")
        print("Please export your AWS Learner Lab credentials:")
        print("   export AWS_ACCESS_KEY_ID=...")
        print("   export AWS_SECRET_ACCESS_KEY=...")
        print("   export AWS_SESSION_TOKEN=...")
        print("   export AWS_DEFAULT_REGION=us-east-1")
        sys.exit(1)


def main():
    print_banner("CS361 e-Mailbox AWS Serverless Deployment")

    session, account_id, region = get_aws_credentials_and_session()
    s3_client = session.client("s3")
    lambda_client = session.client("lambda")

    # Prompt or load MONGO_URI
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri or "localhost" in mongo_uri:
        print("\n⚠️  No cloud MONGO_URI detected in environment.")
        user_input = input("Enter your MongoDB Atlas Connection String (or press Enter for default placeholder): ").strip()
        if user_input:
            mongo_uri = user_input
        else:
            mongo_uri = "mongodb://localhost:27017/e_mailbox"
            print(f"Using default: {mongo_uri}")

    # Resource Names
    bucket_doc_name = f"cs361-g3-documents-{account_id}"
    bucket_frontend_name = f"cs361-g3-frontend-{account_id}"
    lambda_name = "cs361-g3-backend"
    role_arn = f"arn:aws:iam::{account_id}:role/LabRole"

    # -------------------------------------------------------------
    # Step 1: Create S3 Document Storage Bucket & Seed Files
    # -------------------------------------------------------------
    print_step(1, f"Creating S3 Document Storage Bucket: {bucket_doc_name}")
    try:
        if region == "us-east-1":
            s3_client.create_bucket(Bucket=bucket_doc_name)
        else:
            s3_client.create_bucket(
                Bucket=bucket_doc_name,
                CreateBucketConfiguration={"LocationConstraint": region},
            )
        print(f"✅ S3 Document Bucket created: s3://{bucket_doc_name}")
    except ClientError as e:
        code = e.response["Error"]["Code"]
        if code in ("BucketAlreadyOwnedByYou", "BucketAlreadyExists"):
            print(f"ℹ️  S3 Document Bucket already exists: s3://{bucket_doc_name}")
        else:
            raise

    # Upload initial sample seed PDFs from uploads/ to S3 bucket
    uploads_dir = PROJECT_ROOT / "uploads"
    if uploads_dir.exists():
        print("Uploading seed PDF demo files to S3 bucket...")
        for pdf_file in uploads_dir.glob("*.pdf"):
            s3_key = f"uploads/{pdf_file.name}"
            s3_client.upload_file(
                str(pdf_file),
                bucket_doc_name,
                s3_key,
                ExtraArgs={"ContentType": "application/pdf"},
            )
            print(f"   Uploaded: {s3_key}")

    # -------------------------------------------------------------
    # Step 2: Build Lambda Deployment Package with Dependencies
    # -------------------------------------------------------------
    print_step(2, "Building Lambda Deployment Package (.zip)")
    build_dir = PROJECT_ROOT / ".lambda_build"
    if build_dir.exists():
        shutil.rmtree(build_dir)
    build_dir.mkdir(parents=True, exist_ok=True)

    print("Installing Python dependencies into build package using uv...")
    cmd = [
        "uv", "pip", "install",
        "Flask>=2.3.0",
        "pymongo>=4.3.0",
        "dnspython>=2.3.0",
        "flask-cors>=3.0.10",
        "python-dotenv>=1.0.0",
        "boto3>=1.28.0",
        "--target", str(build_dir),
    ]
    subprocess.run(cmd, check=True)

    print("Copying backend and aws_deploy modules...")
    shutil.copytree(PROJECT_ROOT / "backend", build_dir / "backend")
    shutil.copytree(PROJECT_ROOT / "aws_deploy", build_dir / "aws_deploy")
    if uploads_dir.exists():
        shutil.copytree(uploads_dir, build_dir / "uploads")

    zip_path = PROJECT_ROOT / "lambda_package.zip"
    if zip_path.exists():
        zip_path.unlink()

    print("Compressing into lambda_package.zip...")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(build_dir):
            for file in files:
                file_path = Path(root) / file
                arc_name = file_path.relative_to(build_dir)
                z.write(file_path, arc_name)

    shutil.rmtree(build_dir)
    zip_size_mb = zip_path.stat().st_size / (1024 * 1024)
    print(f"✅ Package built: lambda_package.zip ({zip_size_mb:.2f} MB)")

    # -------------------------------------------------------------
    # Step 3: Deploy AWS Lambda Function (Fat Lambda)
    # -------------------------------------------------------------
    print_step(3, f"Deploying Lambda Function: {lambda_name}")
    with open(zip_path, "rb") as f:
        zip_bytes = f.read()

    env_vars = {
        "MONGO_URI": mongo_uri,
        "S3_BUCKET_NAME": bucket_doc_name,
        "AWS_REGION": region,
    }

    try:
        lambda_client.get_function(FunctionName=lambda_name)
        print(f"Updating existing Lambda function {lambda_name} code & config...")
        lambda_client.update_function_code(
            FunctionName=lambda_name,
            ZipFile=zip_bytes,
        )
        # Wait for update to complete
        time.sleep(3)
        lambda_client.update_function_configuration(
            FunctionName=lambda_name,
            Runtime="python3.11",
            Handler="aws_deploy.lambda_handler.lambda_handler",
            Role=role_arn,
            Timeout=30,
            MemorySize=512,
            Environment={"Variables": env_vars},
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceNotFoundException":
            print(f"Creating new Lambda function {lambda_name}...")
            lambda_client.create_function(
                FunctionName=lambda_name,
                Runtime="python3.11",
                Role=role_arn,
                Handler="aws_deploy.lambda_handler.lambda_handler",
                Code={"ZipFile": zip_bytes},
                Timeout=30,
                MemorySize=512,
                Environment={"Variables": env_vars},
            )
        else:
            raise

    # Clean up local zip
    if zip_path.exists():
        zip_path.unlink()

    print(f"✅ Lambda function {lambda_name} is active.")

    # -------------------------------------------------------------
    # Step 4: Configure Lambda Function URL (Public with CORS)
    # -------------------------------------------------------------
    print_step(4, "Configuring Lambda Function URL (CORS Enabled)")
    cors_config = {
        "AllowOrigins": ["*"],
        "AllowMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "AllowHeaders": ["Content-Type", "Authorization", "X-Requested-With"],
        "MaxAge": 86400,
    }

    try:
        url_resp = lambda_client.create_function_url_config(
            FunctionName=lambda_name,
            AuthType="NONE",
            Cors=cors_config,
        )
        function_url = url_resp["FunctionUrl"]
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceConflictException":
            url_resp = lambda_client.update_function_url_config(
                FunctionName=lambda_name,
                AuthType="NONE",
                Cors=cors_config,
            )
            function_url = url_resp["FunctionUrl"]
        else:
            raise

    # Add public invoke permission for Function URL
    try:
        lambda_client.add_permission(
            FunctionName=lambda_name,
            StatementId="FunctionURLAllowPublicAccess",
            Action="lambda:InvokeFunctionUrl",
            Principal="*",
            FunctionUrlAuthType="NONE",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] != "ResourceConflictException":
            pass

    # Normalize Function URL (strip trailing slash)
    function_url = function_url.rstrip("/")
    print(f"✅ Lambda Function URL: {function_url}")

    # -------------------------------------------------------------
    # Step 5: Create S3 Frontend Bucket & Enable Static Website
    # -------------------------------------------------------------
    print_step(5, f"Creating Frontend S3 Bucket: {bucket_frontend_name}")
    try:
        if region == "us-east-1":
            s3_client.create_bucket(Bucket=bucket_frontend_name)
        else:
            s3_client.create_bucket(
                Bucket=bucket_frontend_name,
                CreateBucketConfiguration={"LocationConstraint": region},
            )
        print(f"✅ S3 Frontend Bucket created: s3://{bucket_frontend_name}")
    except ClientError as e:
        if e.response["Error"]["Code"] not in ("BucketAlreadyOwnedByYou", "BucketAlreadyExists"):
            raise

    # Disable Block Public Access for static website hosting
    print("Configuring public read access on Frontend S3 bucket...")
    try:
        s3_client.put_public_access_block(
            Bucket=bucket_frontend_name,
            PublicAccessBlockConfiguration={
                "BlockPublicAcls": False,
                "IgnorePublicAcls": False,
                "BlockPublicPolicy": False,
                "RestrictPublicBuckets": False,
            },
        )
    except Exception as e:
        print(f"   (Public access block info: {e})")

    # Set Bucket Policy for Public Read
    bucket_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::{bucket_frontend_name}/*",
            }
        ],
    }
    s3_client.put_bucket_policy(
        Bucket=bucket_frontend_name,
        Policy=json.dumps(bucket_policy),
    )

    # Enable Website Configuration
    s3_client.put_bucket_website(
        Bucket=bucket_frontend_name,
        WebsiteConfiguration={
            "IndexDocument": {"Suffix": "html/staff_upload.html"},
            "ErrorDocument": {"Key": "html/staff_upload.html"},
        },
    )

    # -------------------------------------------------------------
    # Step 6: Upload Frontend Files to S3 with Function URL
    # -------------------------------------------------------------
    print_step(6, "Uploading Frontend Assets to S3...")
    frontend_dir = PROJECT_ROOT / "frontend"

    # Upload CSS
    css_file = frontend_dir / "css" / "style.css"
    if css_file.exists():
        s3_client.upload_file(
            str(css_file),
            bucket_frontend_name,
            "css/style.css",
            ExtraArgs={"ContentType": "text/css"},
        )
        print("   Uploaded: css/style.css")

    # Process and upload HTML files with Lambda Function URL injected in memory
    for html_file in (frontend_dir / "html").glob("*.html"):
        content = html_file.read_text(encoding="utf-8")
        # Replace localhost / window.location.origin fallback with deployed Function URL
        # while keeping the local files completely unchanged on disk!
        target_code = f"const API_BASE_URL = '{function_url}';"
        content_patched = content.replace(
            "const API_BASE_URL = ['null', 'http://localhost:5500', 'http://127.0.0.1:5500'].includes(window.location.origin)\n      ? 'http://localhost:5000'\n      : window.location.origin;",
            target_code,
        )
        # Fallback replacement if whitespace differs slightly
        if target_code not in content_patched:
            import re
            content_patched = re.sub(
                r"const API_BASE_URL\s*=\s*\[.*?\]\.includes\(.*?\)\s*\?\s*['\"].*?['\"]\s*:\s*window\.location\.origin;",
                target_code,
                content,
                flags=re.DOTALL,
            )

        s3_key = f"html/{html_file.name}"
        s3_client.put_object(
            Bucket=bucket_frontend_name,
            Key=s3_key,
            Body=content_patched.encode("utf-8"),
            ContentType="text/html",
        )
        print(f"   Uploaded: {s3_key} (Connected to Lambda URL)")

    # Upload a root index.html redirector
    index_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=html/staff_upload.html" />
</head>
<body>
    <p>Redirecting to <a href="html/staff_upload.html">Staff Upload</a>...</p>
</body>
</html>"""
    s3_client.put_object(
        Bucket=bucket_frontend_name,
        Key="index.html",
        Body=index_html.encode("utf-8"),
        ContentType="text/html",
    )
    print("   Uploaded: index.html (Root redirect)")

    # S3 Website URL format
    if region == "us-east-1":
        website_url = f"http://{bucket_frontend_name}.s3-website-us-east-1.amazonaws.com"
    else:
        website_url = f"http://{bucket_frontend_name}.s3-website.{region}.amazonaws.com"

    # -------------------------------------------------------------
    # Deployment Summary
    # -------------------------------------------------------------
    print_banner("🎉 DEPLOYMENT COMPLETE! 🎉")
    print(f"🌐 S3 Frontend Website : {website_url}")
    print(f"   - Staff Upload Page : {website_url}/html/staff_upload.html")
    print(f"   - Lecturer View Page: {website_url}/html/lecturer_view.html")
    print(f"⚡ Lambda Function URL  : {function_url}/api/v1/documents")
    print(f"📁 S3 Document Storage : s3://{bucket_doc_name}")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    main()
