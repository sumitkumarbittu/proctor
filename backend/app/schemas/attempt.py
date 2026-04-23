from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.models.attempt import AttemptStatus
from app.models.user import UserRole

class ResponseCreate(BaseModel):
    question_id: int
    answer: str

class AttemptBase(BaseModel):
    exam_id: int

class AttemptCreate(AttemptBase):
    pass

class AttemptUpdate(BaseModel):
    responses: List[ResponseCreate]

class AttemptStudent(BaseModel):
    id: int
    name: Optional[str] = None
    email: str
    role: UserRole

    class Config:
        from_attributes = True


class AttemptResult(BaseModel):
    total_score: float
    max_score: float
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Attempt(AttemptBase):
    id: int
    student_id: int
    status: AttemptStatus
    started_at: datetime
    submitted_at: Optional[datetime] = None
    student: Optional[AttemptStudent] = None
    result: Optional[AttemptResult] = None

    class Config:
        from_attributes = True


class Evaluation(BaseModel):
    marks_awarded: float


class ProctorLogCreate(BaseModel):
    event_type: str
    metadata_info: Optional[str] = None
