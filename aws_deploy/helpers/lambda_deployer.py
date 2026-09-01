"""AWS Lambda function provisioning and Function URL configuration."""

import time
from pathlib import Path
from botocore.exceptions import ClientError


def wait_for_lambda_ready(lambda_client, function_name: str, message: str = "Waiting for Lambda"):
    """Poll AWS Lambda until its status is Successful/Active with live dots."""
    print(f"   [INFO] {message}...", end="", flush=True)
    for _ in range(60):
        try:
            config = lambda_client.get_function_configuration(FunctionName=function_name)
            state = config.get("State", "Active")
            update_status = config.get("LastUpdateStatus", "Successful")
            if state in ("Active", "Failed") and update_status in ("Successful", "Failed"):
                print(" [Done]")
                return
        except ClientError:
            pass
        print(".", end="", flush=True)
        time.sleep(1)
    print(" [Done]")


def deploy_lambda_function(
    session,
    account_id: str,
    region: str,
    doc_bucket: str,
    mongo_uri: str,
    zip_path: Path,
) -> str:
    """Deploy or update the Fat Lambda function using fast S3-backed transfer.

    Returns:
        str: The public HTTPS endpoint for the Lambda Function URL.
    """
    s3_client = session.client("s3")
    lambda_client = session.client("lambda")
    lambda_name = "cs361-g3-backend"
    role_arn = f"arn:aws:iam::{account_id}:role/LabRole"

    env_vars = {
        "MONGO_URI": mongo_uri,
        "S3_BUCKET_NAME": doc_bucket,
    }

    print(f"\ninfo: [Step 3] Deploying Lambda Function: {lambda_name}")

    # 1. Upload zip to S3 Document bucket for instant internal AWS deployment
    s3_deploy_key = "deploy/lambda_package.zip"
    print(f"   [INFO] Uploading package to s3://{doc_bucket}/{s3_deploy_key}...", end="", flush=True)
    s3_client.upload_file(str(zip_path), doc_bucket, s3_deploy_key)
    print(" [Done]")

    # 2. Create or update Lambda function using S3 reference
    try:
        lambda_client.get_function(FunctionName=lambda_name)
        print("   [INFO] Updating existing Lambda code...", end="", flush=True)
        lambda_client.update_function_code(
            FunctionName=lambda_name,
            S3Bucket=doc_bucket,
            S3Key=s3_deploy_key,
        )
        print(" [Done]")
        wait_for_lambda_ready(lambda_client, lambda_name, "Waiting for code deployment to activate")

        print("   [INFO] Updating configuration & environment variables...", end="", flush=True)
        lambda_client.update_function_configuration(
            FunctionName=lambda_name,
            Runtime="python3.11",
            Handler="aws_deploy.lambda_handler.lambda_handler",
            Role=role_arn,
            Timeout=30,
            MemorySize=512,
            Environment={"Variables": env_vars},
        )
        print(" [Done]")
        wait_for_lambda_ready(lambda_client, lambda_name, "Waiting for configuration to apply")

    except ClientError as err:
        if err.response["Error"]["Code"] == "ResourceNotFoundException":
            print("   [INFO] Creating new Lambda function...", end="", flush=True)
            lambda_client.create_function(
                FunctionName=lambda_name,
                Runtime="python3.11",
                Role=role_arn,
                Handler="aws_deploy.lambda_handler.lambda_handler",
                Code={"S3Bucket": doc_bucket, "S3Key": s3_deploy_key},
                Timeout=30,
                MemorySize=512,
                Environment={"Variables": env_vars},
            )
            print(" [Done]")
            wait_for_lambda_ready(lambda_client, lambda_name, "Waiting for Lambda function to become Active")
        else:
            raise

    # Clean up local zip
    if zip_path.exists():
        zip_path.unlink()

    # 3. Configure public Lambda Function URL with CORS
    print("   [INFO] Configuring Lambda Function URL & CORS...", end="", flush=True)
    cors_config = {
        "AllowOrigins": ["*"],
        "AllowMethods": ["*"],
        "AllowHeaders": ["*"],
        "MaxAge": 86400,
    }

    try:
        url_resp = lambda_client.create_function_url_config(
            FunctionName=lambda_name,
            AuthType="NONE",
            Cors=cors_config,
        )
        function_url = url_resp["FunctionUrl"]
    except ClientError as err:
        if err.response["Error"]["Code"] == "ResourceConflictException":
            url_resp = lambda_client.update_function_url_config(
                FunctionName=lambda_name,
                AuthType="NONE",
                Cors=cors_config,
            )
            function_url = url_resp["FunctionUrl"]
        else:
            raise

    # Allow public invocation
    try:
        lambda_client.add_permission(
            FunctionName=lambda_name,
            StatementId="FunctionURLAllowPublicAccess",
            Action="lambda:InvokeFunctionUrl",
            Principal="*",
            FunctionUrlAuthType="NONE",
        )
    except ClientError as err:
        if err.response["Error"]["Code"] != "ResourceConflictException":
            pass

    function_url = function_url.rstrip("/")
    print(" [Done]")
    print(f"info: Lambda Function URL active: {function_url}")
    return function_url
