import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import relationship

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
    max_attempts_per_student = Column(Integer, nullable=False, default=1)
    password_required = Column(Boolean, nullable=False, default=True)
    password_hash = Column(String, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    schedule_updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    schedule_updated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())

    creator = relationship("User", back_populates="exams_created", foreign_keys=[created_by])
    questions = relationship("ExamQuestion", back_populates="exam", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="exam", cascade="all, delete-orphan")
    teacher_assignments = relationship(
        "TeacherAssignment",
        back_populates="exam",
        cascade="all, delete-orphan",
    )
    attempts = relationship("Attempt", back_populates="exam")


class QuestionFolder(Base):
    __tablename__ = "question_folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="question_folders")
    questions = relationship("Question", back_populates="folder", cascade="all, delete-orphan")
    shares = relationship(
        "QuestionFolderShare",
        back_populates="folder",
        cascade="all, delete-orphan",
    )


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(QuestionType), nullable=False)
    prompt = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)
    correct_option = Column(String, nullable=True)
    marks = Column(Integer, default=1)
    created_by = Column(Integer, ForeignKey("users.id"))
    folder_id = Column(Integer, ForeignKey("question_folders.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=func.now())

    folder = relationship("QuestionFolder", back_populates="questions")
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


class TeacherAssignment(Base):
    __tablename__ = "teacher_assignments"

    exam_id = Column(Integer, ForeignKey("exams.id"), primary_key=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    assigned_at = Column(DateTime, default=func.now())

    exam = relationship("Exam", back_populates="teacher_assignments")
    teacher = relationship("User", back_populates="teacher_exam_assignments")


class QuestionFolderShare(Base):
    __tablename__ = "question_folder_shares"

    folder_id = Column(Integer, ForeignKey("question_folders.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    shared_at = Column(DateTime, default=func.now())

    folder = relationship("QuestionFolder", back_populates="shares")
    user = relationship("User", back_populates="shared_question_folder_links")
