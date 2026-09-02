"""AWS authentication and environment configuration loader."""

import os
import sys
from pathlib import Path
import boto3

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


def load_env_file():
    """Load key-value pairs from .env into os.environ if present."""
    env_path = PROJECT_ROOT / ".env"
    if not env_path.exists():
        return

    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))


def get_aws_session():
    """Verify AWS credentials using STS and return an active boto3 session.
    
    Returns:
        tuple: (boto3.Session, account_id: str, region: str)
    """
    load_env_file()
    region = os.getenv("AWS_DEFAULT_REGION") or os.getenv("AWS_REGION") or "us-east-1"
    session = boto3.Session(region_name=region)

    try:
        identity = session.client("sts").get_caller_identity()
        account_id = identity["Account"]
        print(f"info: AWS Connected | Account: {account_id} | Region: {region} | ARN: {identity['Arn']}")
        return session, account_id, region
    except Exception:
        print("\nerror: AWS Authentication Failed. Please export your AWS Learner Lab credentials:")
        print("   export AWS_ACCESS_KEY_ID='...'")
        print("   export AWS_SECRET_ACCESS_KEY='...'")
        print("   export AWS_SESSION_TOKEN='...'")
        print("   export AWS_DEFAULT_REGION='us-east-1'\n")
        sys.exit(1)


def normalize_mongo_uri(uri: str) -> str:
    """Ensure MongoDB connection string includes the default database name."""
    if not uri:
        return uri
    if ".mongodb.net/?" in uri and "/e_mailbox?" not in uri:
        return uri.replace(".mongodb.net/?", ".mongodb.net/e_mailbox?")
    if uri.endswith(".mongodb.net"):
        return uri + "/e_mailbox"
    return uri


def get_mongo_uri():
    """Retrieve MONGO_URI from environment or prompt the user."""
    mongo_uri = os.getenv("MONGO_URI")
    if mongo_uri and "localhost" not in mongo_uri:
        return normalize_mongo_uri(mongo_uri)

    print("\nerror:  No cloud MongoDB URI found in environment.")
    user_input = input("Enter your MongoDB Atlas Connection String (or press Enter for default): ").strip()
    return normalize_mongo_uri(user_input) if user_input else "mongodb://localhost:27017/e_mailbox"
