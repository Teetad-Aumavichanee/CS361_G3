"""Amazon S3 file storage adapter matching FileStorageService interface."""

import os
from pathlib import Path
from uuid import uuid4
import boto3
from botocore.exceptions import ClientError
from werkzeug.utils import secure_filename


class S3FileStorageService:
    """Save, retrieve, and delete files using Amazon S3."""

    def __init__(self, bucket_name=None, region_name=None):
        self.bucket_name = bucket_name or os.getenv("S3_BUCKET_NAME", "cs361-g3-documents")
        self.region_name = region_name or os.getenv("AWS_REGION", "us-east-1")
        self.s3_client = boto3.client("s3", region_name=self.region_name)
        self.temp_dir = Path("/tmp/uploads")
        self.temp_dir.mkdir(parents=True, exist_ok=True)

    def save_file(self, uploaded_file):
        """Save a file directly to the S3 bucket and return metadata."""
        original_filename = getattr(uploaded_file, "filename", None)
        if not isinstance(original_filename, str) or not original_filename.strip():
            raise ValueError("Uploaded file must have a filename")

        original_filename = Path(original_filename).name
        safe_filename = secure_filename(original_filename)
        if not safe_filename:
            raise ValueError("Uploaded filename is not valid")

        s3_key = f"uploads/{uuid4().hex}_{safe_filename}"
        file_type = (
            getattr(uploaded_file, "mimetype", None)
            or "application/octet-stream"
        )

        # Read file contents and upload to S3
        file_bytes = uploaded_file.read()
        file_size = len(file_bytes)

        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=s3_key,
            Body=file_bytes,
            ContentType=file_type,
        )

        return {
            "file_path": s3_key,
            "file_name": original_filename,
            "file_type": file_type,
            "file_size": file_size,
        }

    def get_file(self, file_path):
        """Download file from S3 to /tmp if needed and return local path for send_file."""
        s3_key = str(file_path).lstrip("/")
        # If path is stored as full /app/uploads/... or local path, convert to S3 key
        if "uploads/" in s3_key:
            s3_key = s3_key[s3_key.find("uploads/"):]

        local_cached_path = self.temp_dir / Path(s3_key).name
        if not local_cached_path.exists():
            try:
                self.s3_client.download_file(
                    self.bucket_name,
                    s3_key,
                    str(local_cached_path),
                )
            except ClientError as error:
                # Check if it exists locally in the project bundle as fallback
                fallback_local = Path("uploads") / Path(s3_key).name
                if fallback_local.exists():
                    return fallback_local
                raise FileNotFoundError(f"Stored S3 file not found: {s3_key}") from error

        return local_cached_path

    def delete_file(self, file_path):
        """Delete file from S3."""
        s3_key = str(file_path).lstrip("/")
        if "uploads/" in s3_key:
            s3_key = s3_key[s3_key.find("uploads/"):]

        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key,
            )
            local_cached_path = self.temp_dir / Path(s3_key).name
            if local_cached_path.exists():
                local_cached_path.unlink()
            return True
        except ClientError:
            return 
