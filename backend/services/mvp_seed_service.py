"""Seed the first three MVP documents for a fresh deployment."""

from datetime import datetime, timezone
from mimetypes import guess_type
from pathlib import Path

from backend.config import UPLOAD_FOLDER
from backend.models import Document


# Keep the stakeholder demo files deterministic and tied to files committed in
# the project's uploads directory.
MVP_SEED_DOCUMENTS = [
    {
        "filename": "aa53f3fa396547cb87b9a79c4f1ba01b_CS232_CS332_Module06-Compute-Part1.pdf",
        "title": "เอกสารประกอบการเรียน CS232/CS332 - Part 1",
        "sender": "ฝ่ายวิชาการ",
        "receiver": "อาจารย์และบุคลากร",
    },
    {
        "filename": "2aade10e3a2249a5a6f189455378f07f_CS232_CS332_Module06-Compute-Part2.pdf",
        "title": "เอกสารประกอบการเรียน CS232/CS332 - Part 2",
        "sender": "ฝ่ายวิชาการ",
        "receiver": "อาจารย์และบุคลากร",
    },
    {
        "filename": "164c0a3bfe4f42979042b2490b580371_aa53f3fa396547cb87b9a79c4f1ba01b_CS232_CS332_Module06-Compute-Part1.pdf",
        "title": "เอกสารตัวอย่างสำหรับการทดสอบระบบ e-Mailbox",
        "sender": "ผู้ดูแลระบบ",
        "receiver": "ผู้ใช้งานระบบ",
    },
]


def seed_mvp_documents():
    """Create the three MVP records when the database is empty."""
    if Document.collection.count_documents({}) > 0:
        return 0

    upload_folder = Path(UPLOAD_FOLDER).resolve()
    seed_date = datetime.now(timezone.utc).date().isoformat()
    seed_timestamp = datetime.now(timezone.utc)
    records = []

    for seed_document in MVP_SEED_DOCUMENTS:
        file_path = upload_folder / seed_document["filename"]
        if not file_path.is_file():
            return 0

        file_type = guess_type(file_path.name)[0] or "application/octet-stream"
        records.append(
            Document(
                title=seed_document["title"],
                document_date=seed_date,
                sender=seed_document["sender"],
                receiver=seed_document["receiver"],
                file_path=str(file_path),
                file_name=file_path.name,
                file_type=file_type,
                file_size=file_path.stat().st_size,
                uploaded_by="mvp-seed",
                uploaded_at=seed_timestamp,
            )
        )

    for document in records:
        document.create()

    return len(records)
