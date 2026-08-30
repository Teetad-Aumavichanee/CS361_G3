"""Model for document types."""

from backend.models.database import db


class DocumentType:
    """Represent a document type stored in MongoDB."""

    # Reuse one collection handle for all document type operations.
    collection = db["document_types"]

    # Create a document type and validate its required human-readable name.
    def __init__(self, name, document_type_id=None):
        # Empty names would create unusable document type records.
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Document type name must be a non-empty string")

        # MongoDB creates the _id when this object is first inserted if it is
        # not already known.
        self.id = document_type_id
        self.name = name.strip()

    # Convert the Python model into the shape expected by MongoDB.
    def to_mongo(self):
        """Return the model as a MongoDB document."""
        document = {"name": self.name}

        # Keep an existing _id when updating or re-serializing a stored model.
        if self.id is not None:
            document["_id"] = self.id
        return document

    # Convert a MongoDB result back into a Python model instance.
    @classmethod
    def from_mongo(cls, document):
        """Build a model from a MongoDB document."""
        return cls(
            name=document["name"],
            document_type_id=document.get("_id"),
        )
