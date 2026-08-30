"""Business operations for registered documents."""

from backend.models import Document, DocumentType
from backend.services.file_storage_service import FileStorageService


class DocumentService:
    """Coordinate document metadata and uploaded file operations."""

    # Create the service and allow a storage implementation to be supplied in
    # tests or by a future application configuration.
    def __init__(self, file_storage_service=None):
        self.file_storage_service = file_storage_service or FileStorageService()

    # Save the file and its MongoDB metadata as one document-registration flow.
    def register_document(
        self,
        document_type_id,
        title,
        uploaded_by,
        uploaded_file,
    ):
        """Store an uploaded file and return its registered Document model."""
        if DocumentType.find_by_id(document_type_id) is None:
            raise ValueError("Document type was not found")

        file_metadata = self.file_storage_service.save_file(uploaded_file)
        try:
            document = Document(
                document_type_id=document_type_id,
                title=title,
                file_path=file_metadata["file_path"],
                file_name=file_metadata["file_name"],
                file_type=file_metadata["file_type"],
                file_size=file_metadata["file_size"],
                uploaded_by=uploaded_by,
            )
            return document.create()
        except Exception:
            # Prevent an orphaned file when MongoDB registration fails.
            self.file_storage_service.delete_file(file_metadata["file_path"])
            raise

    # Retrieve one registered document by its MongoDB id.
    def get_document(self, document_id):
        """Return the document or None when it does not exist."""
        return Document.find_by_id(document_id)

    # Retrieve all registered documents.
    def get_all_documents(self):
        """Return all registered document models."""
        return Document.find_all()

    # Validate and update metadata for an existing registered document.
    def update_document(self, document_id, changes):
        """Return the updated model or None when it does not exist."""
        document = self.get_document(document_id)
        if document is None:
            return None

        if not document.update(**changes):
            return None
        return document

    # Delete both the database record and its stored file.
    def delete_document(self, document_id):
        """Delete a document and return whether its record was removed."""
        document = self.get_document(document_id)
        if document is None:
            return False

        if not document.delete():
            return False

        # A missing file is harmless because the database record is already
        # gone and there is no file left to remove.
        self.file_storage_service.delete_file(document.file_path)
        return True

    # Resolve a document's stored file for a download route.
    def get_document_file(self, document_id):
        """Return the stored file path for a document."""
        document = self.get_document(document_id)
        if document is None:
            return None
        return self.file_storage_service.get_file(document.file_path)
