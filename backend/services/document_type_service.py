"""Business operations for document types."""

from backend.models import DocumentType


class DocumentTypeService:
    """Coordinate document type use cases for routes and other callers."""

    # Create and persist a new document type.
    @staticmethod
    def create_type(name):
        """Return a newly created document type."""
        return DocumentType(name=name).create()

    # Retrieve one document type by its MongoDB id.
    @staticmethod
    def get_type(document_type_id):
        """Return the document type or None when it does not exist."""
        return DocumentType.find_by_id(document_type_id)

    # Retrieve every document type for selection lists and administration.
    @staticmethod
    def get_all_types():
        """Return all document types."""
        return DocumentType.find_all()

    # Find, validate, and update an existing document type.
    @staticmethod
    def update_type(document_type_id, name):
        """Return the updated model or None when it does not exist."""
        document_type = DocumentType.find_by_id(document_type_id)
        if document_type is None:
            return None

        if not document_type.update(name):
            return None
        return document_type

    # Find and delete an existing document type.
    @staticmethod
    def delete_type(document_type_id):
        """Return True when a document type was deleted, otherwise False."""
        document_type = DocumentType.find_by_id(document_type_id)
        if document_type is None:
            return False
        return document_type.delete()
