from sqlalchemy import Boolean, Column, Integer, String, Enum, DateTime, ForeignKey, JSON, Text, func
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base

class ExamStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SCHEDULED = "SCHEDULED"
    LIVE = "LIVE"
    CLOSED = "CLOSED"
    RESULT_PUBLISHED = "RESULT_PUBLISHED"

class QuestionType(str, enum.Enum):
    MCQ = "MCQ"
    SUBJECTIVE = "SUBJECTIVE"

class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    instructions = Column(Text)
    status = Column(Enum(ExamStatus), default=ExamStatus.DRAFT)
    start_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())

    creator = relationship("User", back_populates="exams_created")
    questions = relationship("ExamQuestion", back_populates="exam", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="exam", cascade="all, delete-orphan")
    attempts = relationship("Attempt", back_populates="exam")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(QuestionType), nullable=False)
    prompt = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)  # For MCQ
    correct_option = Column(String, nullable=True) # For MCQ
    marks = Column(Integer, default=1)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())

    exams = relationship("ExamQuestion", back_populates="question")

class ExamQuestion(Base):
    __tablename__ = "exam_questions"

    exam_id = Column(Integer, ForeignKey("exams.id"), primary_key=True)
    question_id = Column(Integer, ForeignKey("questions.id"), primary_key=True)
    order_index = Column(Integer, default=0)

    exam = relationship("Exam", back_populates="questions")
    question = relationship("Question", back_populates="exams")

class Assignment(Base):
    __tablename__ = "assignments"

    exam_id = Column(Integer, ForeignKey("exams.id"), primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"), primary_key=True)

    exam = relationship("Exam", back_populates="assignments")
    student = relationship("User", back_populates="assignments")
