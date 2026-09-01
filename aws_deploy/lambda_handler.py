"""AWS Lambda entrypoint for the e-Mailbox Flask application."""

import os
import sys

# Ensure root directory is on Python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app import app
from backend.routes import documents as documents_route_module
from aws_deploy.s3_storage_service import S3FileStorageService
from aws_deploy.wsgi_adapter import handle_lambda_request

# Dynamically inject the S3 storage service into the existing document_service
# without modifying any of your teammate's backend code.
s3_storage = S3FileStorageService()
documents_route_module.document_service.file_storage_service = s3_storage


def lambda_handler(event, context):
    """Main Lambda invocation handler for Lambda Function URL."""
    return handle_lambda_request(app, event, context)
