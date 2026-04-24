"""
Trash / Recently Deleted  — soft-delete tombstones for all deletable entities.

A row here means the real row was physically deleted but we keep a serialized
snapshot so admins / teachers can inspect and restore it.
"""
import enum
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class TrashEntityType(str, enum.Enum):
    USER = "user"
    EXAM = "exam"
    QUESTION = "question"
    FOLDER = "folder"
    ATTEMPT = "attempt"


class TrashedItem(Base):
    __tablename__ = "trash"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(Enum(TrashEntityType), nullable=False, index=True)
    # Original primary key of the deleted row
    original_id = Column(Integer, nullable=False, index=True)
    # Human-readable label (exam title, user email, question prompt snippet …)
    label = Column(String, nullable=False)
    # Full JSON snapshot of the deleted object so we can show details
    snapshot = Column(JSON, nullable=False)
    deleted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    deleted_at = Column(DateTime, default=func.now(), nullable=False)

    deleted_by_user = relationship("User", foreign_keys=[deleted_by])
