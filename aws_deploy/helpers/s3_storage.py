"""Amazon S3 document storage bucket provisioning and seed file management."""

from pathlib import Path
from botocore.exceptions import ClientError

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


def setup_document_bucket(session, account_id: str, region: str) -> str:
    """Create the S3 Document Storage bucket and seed initial demo PDF files.

    Args:
        session: Active boto3 Session.
        account_id: AWS Account ID string.
        region: AWS Region name.

    Returns:
        str: Created S3 bucket name.
    """
    s3_client = session.client("s3")
    bucket_name = f"cs361-g3-documents-{account_id}"

    print(f"\ninfo: [Step 1] Setting up S3 Document Storage: {bucket_name}")

    try:
        if region == "us-east-1":
            s3_client.create_bucket(Bucket=bucket_name)
        else:
            s3_client.create_bucket(
                Bucket=bucket_name,
                CreateBucketConfiguration={"LocationConstraint": region},
            )
        print(f"info: S3 Document Bucket ready: s3://{bucket_name}")
    except ClientError as err:
        if err.response["Error"]["Code"] in ("BucketAlreadyOwnedByYou", "BucketAlreadyExists"):
            print(f"info: S3 Document Bucket already exists: s3://{bucket_name}")
        else:
            raise

    # Upload initial seed PDF documents for grading demo (skip if already in S3)
    uploads_dir = PROJECT_ROOT / "uploads"
    if uploads_dir.exists():
        pdf_files = list(uploads_dir.glob("*.pdf"))
        if pdf_files:
            print(f"   [INFO] Checking {len(pdf_files)} demo PDF files...", end="", flush=True)
            for pdf_path in pdf_files:
                s3_key = f"uploads/{pdf_path.name}"
                try:
                    s3_client.head_object(Bucket=bucket_name, Key=s3_key)
                except ClientError:
                    s3_client.upload_file(
                        str(pdf_path),
                        bucket_name,
                        s3_key,
                        ExtraArgs={"ContentType": "application/pdf"},
                    )
            print(" [Done]")

    return bucket_name
