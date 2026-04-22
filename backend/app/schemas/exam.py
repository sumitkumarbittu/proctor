from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime
from app.models.exam import ExamStatus, QuestionType

# -- Question Schemas --
class QuestionBase(BaseModel):
    type: QuestionType
    prompt: str
    options: Optional[List[str]] = None
    marks: int = 1

class QuestionCreate(QuestionBase):
    correct_option: Optional[str] = None

class QuestionUpdate(BaseModel):
    type: Optional[QuestionType] = None
    prompt: Optional[str] = None
    options: Optional[List[str]] = None
    correct_option: Optional[str] = None
    marks: Optional[int] = None

class Question(QuestionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# -- Exam Question Association Schema --
class ExamQuestionBase(BaseModel):
    question_id: int
    order_index: int

class ExamQuestion(ExamQuestionBase):
    question: Question

    class Config:
        from_attributes = True

# -- Exam Schemas --
class ExamBase(BaseModel):
    title: str
    instructions: Optional[str] = None
    duration_minutes: int
    start_time: Optional[datetime] = None
    status: ExamStatus = ExamStatus.DRAFT

class ExamCreate(ExamBase):
    pass

class ExamUpdate(BaseModel):
    title: Optional[str] = None
    instructions: Optional[str] = None
    duration_minutes: Optional[int] = None
    start_time: Optional[datetime] = None
    status: Optional[ExamStatus] = None

class Exam(ExamBase):
    id: int
    created_by: int
    created_at: datetime
    questions: List[ExamQuestion] = [] 

    class Config:
        from_attributes = True

class ExamAssign(BaseModel):
    student_ids: List[int]
