from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Text, Float, func
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base

class AttemptStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    SUBMITTED = "SUBMITTED"
    EVALUATED = "EVALUATED"

class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(AttemptStatus), default=AttemptStatus.IN_PROGRESS)
    started_at = Column(DateTime, default=func.now())
    submitted_at = Column(DateTime, nullable=True)

    exam = relationship("Exam", back_populates="attempts")
    student = relationship("User", back_populates="attempts")
    responses = relationship("Response", back_populates="attempt", cascade="all, delete-orphan")
    logs = relationship("ProctoringLog", back_populates="attempt", cascade="all, delete-orphan")
    result = relationship("Result", uselist=False, back_populates="attempt")

class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    answer = Column(Text, nullable=True)
    marks_awarded = Column(Float, default=0.0)

    attempt = relationship("Attempt", back_populates="responses")
    question = relationship("Question")

class ProctoringLog(Base):
    __tablename__ = "proctoring_logs"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"), nullable=False)
    event_type = Column(String, nullable=False) # e.g., TAB_SWITCH, BLUR, FACE_NOT_VISIBLE (future)
    severity = Column(String, default="WARNING")
    metadata_info = Column(Text, nullable=True) # Renamed from metadata to avoid SQLAlchemy conflict
    created_at = Column(DateTime, default=func.now())

    attempt = relationship("Attempt", back_populates="logs")

class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"), unique=True, nullable=False)
    total_score = Column(Float, default=0.0)
    max_score = Column(Float, default=0.0)
    published_at = Column(DateTime, default=func.now())

    attempt = relationship("Attempt", back_populates="result")
