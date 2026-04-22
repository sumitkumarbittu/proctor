from sqlalchemy import Boolean, Column, Integer, String, Enum, DateTime, func
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    EXAMINER = "examiner"
    STUDENT = "student"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    exams_created = relationship("Exam", back_populates="creator")
    assignments = relationship("Assignment", back_populates="student")
    attempts = relationship("Attempt", back_populates="student")
