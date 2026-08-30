"""MongoDB connection used by the model classes."""

from pymongo import MongoClient

from backend.config import MONGO_URI


# MongoClient connects lazily, so importing the models does not immediately
# require MongoDB to be available.
client = MongoClient(MONGO_URI)

# The database name is read from the MongoDB URI, for example e_mailbox in
# mongodb://localhost:27017/e_mailbox.
db = client.get_default_database()
