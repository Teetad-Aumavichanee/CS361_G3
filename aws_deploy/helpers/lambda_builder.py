"""Package builder for AWS Lambda deployment zip."""

import os
import shutil
import subprocess
import zipfile
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

# Python runtime dependencies packaged into the Lambda deployment artifact
LAMBDA_DEPENDENCIES = [
    "Flask>=2.3.0",
    "pymongo>=4.3.0",
    "dnspython>=2.3.0",
    "flask-cors>=3.0.10",
    "python-dotenv>=1.0.0",
    "boto3>=1.28.0",
]


def build_lambda_package() -> Path:
    """Bundle Python dependencies and application code into a deployment zip using uv.

    Returns:
        Path: Path to the generated lambda_package.zip file.
    """
    print("\n[Step 2] Packaging Lambda Deployment Bundle (.zip)")

    build_dir = PROJECT_ROOT / ".lambda_build"
    if build_dir.exists():
        shutil.rmtree(build_dir)
    build_dir.mkdir(parents=True, exist_ok=True)

    # 1. Install production dependencies into temporary build directory via uv
    print("info: Installing dependencies with uv...")
    cmd = ["uv", "pip", "install", *LAMBDA_DEPENDENCIES, "--target", str(build_dir)]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)

    # 2. Copy application modules into the package
    shutil.copytree(PROJECT_ROOT / "backend", build_dir / "backend")
    shutil.copytree(PROJECT_ROOT / "aws_deploy", build_dir / "aws_deploy")

    uploads_dir = PROJECT_ROOT / "uploads"
    if uploads_dir.exists():
        shutil.copytree(uploads_dir, build_dir / "uploads")

    # 3. Create zip archive
    zip_path = PROJECT_ROOT / "lambda_package.zip"
    if zip_path.exists():
        zip_path.unlink()

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for root, _, files in os.walk(build_dir):
            for file in files:
                abs_path = Path(root) / file
                archive.write(abs_path, abs_path.relative_to(build_dir))

    shutil.rmtree(build_dir)
    size_mb = zip_path.stat().st_size / (1024 * 1024)
    print(f"info: ambda package created: lambda_package.zip ({size_mb:.2f} MB)")
    return zip_path
