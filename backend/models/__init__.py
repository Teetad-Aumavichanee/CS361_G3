"""MongoDB models."""

#provide cleaner import for other class
from backend.models.document import Document
from backend.models.document_type import DocumentType

__all__ = ["Document", "DocumentType"]