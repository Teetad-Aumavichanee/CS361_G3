"""AWS Lambda function provisioning and Function URL configuration."""

import time
from pathlib import Path
from botocore.exceptions import ClientError


def deploy_lambda_function(
    session,
    account_id: str,
    region: str,
    doc_bucket: str,
    mongo_uri: str,
    zip_path: Path,
) -> str:
    """Deploy or update the Fat Lambda function and configure its public Function URL.

    Returns:
        str: The public HTTPS endpoint for the Lambda Function URL.
    """
    lambda_client = session.client("lambda")
    lambda_name = "cs361-g3-backend"
    role_arn = f"arn:aws:iam::{account_id}:role/LabRole"

    env_vars = {
        "MONGO_URI": mongo_uri,
        "S3_BUCKET_NAME": doc_bucket,
        "AWS_REGION": region,
    }

    print(f"\ninfo: [Step 3] Deploying Lambda Function: {lambda_name}")

    with open(zip_path, "rb") as f:
        zip_bytes = f.read()

    # Create or update Lambda function definition
    try:
        lambda_client.get_function(FunctionName=lambda_name)
        print(f"info: Updating existing Lambda code and configuration...")
        lambda_client.update_function_code(FunctionName=lambda_name, ZipFile=zip_bytes)
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
    except ClientError as err:
        if err.response["Error"]["Code"] == "ResourceNotFoundException":
            print(f"info: Creating new Lambda function...")
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

    # Clean up local zip file
    if zip_path.exists():
        zip_path.unlink()

    # Configure public Lambda Function URL with permissive CORS
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

    # Allow public invocation of Function URL
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
    print(f"info: ambda Function URL active: {function_url}")
    return function_url
