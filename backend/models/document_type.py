"""Model for document types."""

from bson import ObjectId

from backend.models.database import db


class DocumentType:
    """Represent a document type stored in MongoDB."""

    # Reuse one collection handle for all document type operations.
    collection = db["document_types"]

    # Convert an optional id to the type MongoDB uses for primary keys.
    @staticmethod
    def _to_object_id(value):
        if isinstance(value, ObjectId):
            return value
        try:
            return ObjectId(value)
        except Exception as error:
            raise ValueError("document_type_id must be a valid ObjectId") from error

    # Create a document type and validate its required human-readable name.
    def __init__(self, name, document_type_id=None):
        # Empty names would create unusable document type records.
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Document type name must be a non-empty string")

        # MongoDB creates the _id when this object is first inserted if it is
        # not already known.
        self.id = (
            self._to_object_id(document_type_id)
            if document_type_id is not None
            else None
        )
        self.name = name.strip()

    # Insert this new model into MongoDB and keep the generated _id.
    def create(self):
        """Insert the model and return this model with its MongoDB id."""
        if self.id is not None:
            raise ValueError("Cannot create a document type that already has an id")

        result = self.collection.insert_one(self.to_mongo())
        self.id = result.inserted_id
        return self

    # Find one document type by its MongoDB id.
    @classmethod
    def find_by_id(cls, document_type_id):
        """Return a matching model or None when it does not exist."""
        object_id = cls._to_object_id(document_type_id)
        document = cls.collection.find_one({"_id": object_id})
        return cls.from_mongo(document) if document else None

    # Read all document types from the collection.
    @classmethod
    def find_all(cls):
        """Return all document type models."""
        return [cls.from_mongo(document) for document in cls.collection.find()]

    # Convert the Python model into the shape expected by MongoDB.
    def to_mongo(self):
        """Return the model as a MongoDB document."""
        document = {"name": self.name}

        # Keep an existing _id when updating or re-serializing a stored model.
        if self.id is not None:
            document["_id"] = self.id
        return document

    # Validate and update the name of an existing document type.
    def update(self, name):
        """Update this model in MongoDB and return whether it was found."""
        if self.id is None:
            raise ValueError("Cannot update a document type without an id")

        updated_model = DocumentType(name=name, document_type_id=self.id)
        result = self.collection.update_one(
            {"_id": self.id},
            {"$set": {"name": updated_model.name}},
        )

        if result.matched_count:
            self.name = updated_model.name
            return True
        return False

    # Delete this document type from MongoDB.
    def delete(self):
        """Delete this model and return whether a record was removed."""
        if self.id is None:
            raise ValueError("Cannot delete a document type without an id")

        result = self.collection.delete_one({"_id": self.id})
        return result.deleted_count == 1

    # Convert a MongoDB result back into a Python model instance.
    @classmethod
    def from_mongo(cls, document):
        """Build a model from a MongoDB document."""
        return cls(
            name=document["name"],
            document_type_id=document.get("_id"),
        )
