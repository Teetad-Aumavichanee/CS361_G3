"""AWS Lambda and API Gateway HTTP API provisioning."""

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
    """Deploy the Fat Lambda function and expose it via AWS API Gateway HTTP API.

    Returns:
        str: The public HTTPS endpoint for API Gateway.
    """
    s3_client = session.client("s3")
    lambda_client = session.client("lambda")
    apigw_client = session.client("apigatewayv2")
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
        lambda_info = lambda_client.get_function(FunctionName=lambda_name)
        lambda_arn = lambda_info["Configuration"]["FunctionArn"]
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
            create_resp = lambda_client.create_function(
                FunctionName=lambda_name,
                Runtime="python3.11",
                Role=role_arn,
                Handler="aws_deploy.lambda_handler.lambda_handler",
                Code={"S3Bucket": doc_bucket, "S3Key": s3_deploy_key},
                Timeout=30,
                MemorySize=512,
                Environment={"Variables": env_vars},
            )
            lambda_arn = create_resp["FunctionArn"]
            print(" [Done]")
            wait_for_lambda_ready(lambda_client, lambda_name, "Waiting for Lambda function to become Active")
        else:
            raise

    # Clean up local zip
    if zip_path.exists():
        zip_path.unlink()

    # 3. Create or Update API Gateway HTTP API
    print("   [INFO] Configuring API Gateway HTTP API & CORS...", end="", flush=True)
    api_name = "cs361-g3-api"
    api_id = None
    api_endpoint = None

    # Find existing API if present
    apis = apigw_client.get_apis().get("Items", [])
    for api in apis:
        if api.get("Name") == api_name:
            api_id = api["ApiId"]
            api_endpoint = api["ApiEndpoint"]
            break

    if not api_id:
        new_api = apigw_client.create_api(
            Name=api_name,
            ProtocolType="HTTP",
            CorsConfiguration={
                "AllowOrigins": ["*"],
                "AllowMethods": ["*"],
                "AllowHeaders": ["*"],
                "MaxAge": 86400,
            },
        )
        api_id = new_api["ApiId"]
        api_endpoint = new_api["ApiEndpoint"]

        integration = apigw_client.create_integration(
            ApiId=api_id,
            IntegrationType="AWS_PROXY",
            IntegrationUri=lambda_arn,
            PayloadFormatVersion="2.0",
        )
        integration_id = integration["IntegrationId"]

        apigw_client.create_route(
            ApiId=api_id,
            RouteKey="$default",
            Target=f"integrations/{integration_id}",
        )

        apigw_client.create_stage(
            ApiId=api_id,
            StageName="$default",
            AutoDeploy=True,
        )

    # Allow API Gateway to invoke Lambda
    try:
        lambda_client.add_permission(
            FunctionName=lambda_name,
            StatementId="ApiGatewayInvokePermission",
            Action="lambda:InvokeFunction",
            Principal="apigateway.amazonaws.com",
            SourceArn=f"arn:aws:execute-api:{region}:{account_id}:{api_id}/*/*",
        )
    except ClientError:
        pass

    api_endpoint = api_endpoint.rstrip("/")
    print(" [Done]")
    print(f"info: API Gateway active: {api_endpoint}")
    return api_endpoint
