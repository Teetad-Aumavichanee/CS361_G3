# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "boto3>=1.28.0",
#     "python-dotenv>=1.0.0",
# ]
# ///

"""AWS Resource Teardown Script for e-Mailbox."""

import sys
from pathlib import Path
from botocore.exceptions import ClientError

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from aws_deploy.helpers.auth import get_aws_session


def delete_s3_bucket(s3_client, bucket_name: str):
    """Empty and delete an Amazon S3 bucket."""
    print(f"info: Deleting S3 bucket: {bucket_name}...", end="", flush=True)
    try:
        # Delete all objects in bucket first
        paginator = s3_client.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=bucket_name):
            if "Contents" in page:
                delete_keys = [{"Key": obj["Key"]} for obj in page["Contents"]]
                s3_client.delete_objects(Bucket=bucket_name, Delete={"Objects": delete_keys})

        s3_client.delete_bucket(Bucket=bucket_name)
        print(" [Done]")
    except ClientError as err:
        if err.response["Error"]["Code"] == "NoSuchBucket":
            print(" [Not Found / Already Deleted]")
        else:
            print(f" [Error: {err.response['Error']['Message']}]")


def delete_lambda(lambda_client, function_name: str):
    """Delete an AWS Lambda function."""
    print(f"info: Deleting Lambda function: {function_name}...", end="", flush=True)
    try:
        lambda_client.delete_function(FunctionName=function_name)
        print(" [Done]")
    except ClientError as err:
        if err.response["Error"]["Code"] == "ResourceNotFoundException":
            print(" [Not Found / Already Deleted]")
        else:
            print(f" [Error: {err.response['Error']['Message']}]")


def delete_api_gateway(apigw_client, api_name: str):
    """Delete an AWS API Gateway HTTP API."""
    print(f"info: Deleting API Gateway: {api_name}...", end="", flush=True)
    try:
        apis = apigw_client.get_apis().get("Items", [])
        for api in apis:
            if api.get("Name") == api_name:
                apigw_client.delete_api(ApiId=api["ApiId"])
                print(" [Done]")
                return
        print(" [Not Found / Already Deleted]")
    except ClientError as err:
        print(f" [Error: {err.response['Error']['Message']}]")


def main():
    print("info: AWS Teardown Utility")
    session, account_id, region = get_aws_session()

    doc_bucket = f"cs361-g3-documents-{account_id}"
    frontend_bucket = f"cs361-g3-frontend-{account_id}"
    lambda_name = "cs361-g3-backend"
    api_name = "cs361-g3-api"

    print("\nThe following resources will be deleted:")
    print(f" - API Gateway: {api_name}")
    print(f" - Lambda Function: {lambda_name}")
    print(f" - S3 Document Bucket: {doc_bucket}")
    print(f" - S3 Frontend Bucket: {frontend_bucket}")

    confirm = input("\nType 'yes' to confirm teardown: ").strip().lower()
    if confirm != "yes":
        print("info: Teardown cancelled.")
        return

    s3_client = session.client("s3")
    lambda_client = session.client("lambda")
    apigw_client = session.client("apigatewayv2")

    # 1. Delete API Gateway & Lambda
    delete_api_gateway(apigw_client, api_name)
    delete_lambda(lambda_client, lambda_name)

    # 2. Delete S3 Buckets
    delete_s3_bucket(s3_client, doc_bucket)
    delete_s3_bucket(s3_client, frontend_bucket)

    print("\ninfo: All cloud resources have been completely removed.")


if __name__ == "__main__":
    main()
