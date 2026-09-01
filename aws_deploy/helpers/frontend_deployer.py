"""Amazon S3 Static Website deployment and frontend asset synchronization."""

import json
import re
from pathlib import Path
from botocore.exceptions import ClientError

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


def deploy_frontend_website(session, account_id: str, region: str, function_url: str) -> str:
    """Create S3 Frontend bucket, enable static website hosting, and upload assets.

    Returns:
        str: Public HTTP URL for the static website.
    """
    s3_client = session.client("s3")
    bucket_name = f"cs361-g3-frontend-{account_id}"
    print(f"\ninfo: [Step 4] Deploying Frontend to S3 Website: {bucket_name}")

    # 1. Create frontend bucket
    try:
        if region == "us-east-1":
            s3_client.create_bucket(Bucket=bucket_name)
        else:
            s3_client.create_bucket(
                Bucket=bucket_name,
                CreateBucketConfiguration={"LocationConstraint": region},
            )
        print(f"   Bucket created: s3://{bucket_name}")
    except ClientError as err:
        if err.response["Error"]["Code"] not in ("BucketAlreadyOwnedByYou", "BucketAlreadyExists"):
            raise

    # 2. Disable Public Access Block for static website hosting
    try:
        s3_client.delete_public_access_block(Bucket=bucket_name)
    except ClientError:
        try:
            s3_client.put_public_access_block(
                Bucket=bucket_name,
                PublicAccessBlockConfiguration={
                    "BlockPublicAcls": False,
                    "IgnorePublicAcls": False,
                    "BlockPublicPolicy": False,
                    "RestrictPublicBuckets": False,
                },
            )
        except ClientError:
            pass

    # 3. Attach Public Read Policy
    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::{bucket_name}/*",
            }
        ],
    }
    try:
        s3_client.put_bucket_policy(Bucket=bucket_name, Policy=json.dumps(policy))
    except ClientError as err:
        print(f"   [INFO] S3 Public Policy notice: {err.response['Error']['Message']}")

    # 4. Enable Website Hosting
    try:
        s3_client.put_bucket_website(
            Bucket=bucket_name,
            WebsiteConfiguration={
                "IndexDocument": {"Suffix": "index.html"},
                "ErrorDocument": {"Key": "index.html"},
            },
        )
        print(f"   [INFO] S3 Website hosting enabled.")
    except ClientError as err:
        print(f"   [ERROR] Could not enable website hosting: {err}")

    # 5. Upload Assets with dynamic API URL injection
    frontend_dir = PROJECT_ROOT / "frontend"
    print("   [INFO] Uploading and syncing frontend assets...", end="", flush=True)

    css_file = frontend_dir / "css" / "style.css"
    if css_file.exists():
        s3_client.upload_file(str(css_file), bucket_name, "css/style.css", ExtraArgs={"ContentType": "text/css"})

    for html_file in (frontend_dir / "html").glob("*.html"):
        content = html_file.read_text(encoding="utf-8")
        patched = re.sub(
            r"const API_BASE_URL\s*=\s*\[.*?\]\.includes\(.*?\)\s*\?\s*['\"].*?['\"]\s*:\s*window\.location\.origin;",
            f"const API_BASE_URL = '{function_url}';",
            content,
            flags=re.DOTALL,
        )
        s3_client.put_object(
            Bucket=bucket_name,
            Key=f"html/{html_file.name}",
            Body=patched.encode("utf-8"),
            ContentType="text/html",
        )

    # Root redirect index.html
    root_redirect = '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=html/staff_upload.html" /></head></html>'
    s3_client.put_object(Bucket=bucket_name, Key="index.html", Body=root_redirect.encode("utf-8"), ContentType="text/html")
    print(" [Done]")

    website_url = (
        f"http://{bucket_name}.s3-website-us-east-1.amazonaws.com"
        if region == "us-east-1"
        else f"http://{bucket_name}.s3-website.{region}.amazonaws.com"
    )
    print(f"info: S3 Static Website ready: {website_url}")
    return website_url
