"""Local file storage operations for uploaded documents."""

from pathlib import Path
from uuid import uuid4

from werkzeug.utils import secure_filename

from backend.config import UPLOAD_FOLDER


class FileStorageService:
    """Save and remove uploaded files in the configured upload directory."""

    # Create the storage service and ensure its directory is available.
    def __init__(self, upload_folder=None):
        self.upload_folder = Path(upload_folder or UPLOAD_FOLDER).resolve()
        self.upload_folder.mkdir(parents=True, exist_ok=True)

    # Resolve a stored path and prevent access outside the upload directory.
    def _resolve_path(self, file_path):
        path = Path(file_path)
        if not path.is_absolute():
            path = self.upload_folder / path

        resolved_path = path.resolve()
        try:
            resolved_path.relative_to(self.upload_folder)
        except ValueError as error:
            raise ValueError("File path must be inside the upload folder") from error
        return resolved_path

    # Save an uploaded file with a unique, sanitized filename.
    def save_file(self, uploaded_file):
        """Save a file and return its storage metadata."""
        original_filename = getattr(uploaded_file, "filename", None)
        if not isinstance(original_filename, str) or not original_filename.strip():
            raise ValueError("Uploaded file must have a filename")

        original_filename = Path(original_filename).name
        safe_filename = secure_filename(original_filename)
        if not safe_filename:
            raise ValueError("Uploaded filename is not valid")

        stored_filename = f"{uuid4().hex}_{safe_filename}"
        stored_path = self._resolve_path(stored_filename)

        try:
            uploaded_file.save(str(stored_path))
        except Exception:
            # Remove a partial file if saving fails.
            if stored_path.exists():
                stored_path.unlink()
            raise

        return {
            "file_path": str(stored_path),
            "file_name": original_filename,
            "file_type": getattr(uploaded_file, "mimetype", None)
            or "application/octet-stream",
            "file_size": stored_path.stat().st_size,
        }

    # Return the resolved path for a stored file.
    def get_file(self, file_path):
        """Return a stored file path or raise FileNotFoundError."""
        resolved_path = self._resolve_path(file_path)
        if not resolved_path.is_file():
            raise FileNotFoundError(f"Stored file was not found: {file_path}")
        return resolved_path

    # Delete a stored file and report whether it existed.
    def delete_file(self, file_path):
        """Delete a stored file and return True when it existed."""
        resolved_path = self._resolve_path(file_path)
        if not resolved_path.is_file():
            return False

        resolved_path.unlink()
        return True
