from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.models.attempt import AttemptStatus

class ResponseCreate(BaseModel):
    question_id: int
    answer: str

class AttemptBase(BaseModel):
    exam_id: int

class AttemptCreate(AttemptBase):
    pass

class AttemptUpdate(BaseModel):
    responses: List[ResponseCreate]

class Attempt(AttemptBase):
    id: int
    student_id: int
    status: AttemptStatus
    started_at: datetime
    submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Evaluation(BaseModel):
    marks_awarded: float

class ProctorLogCreate(BaseModel):
    event_type: str
    metadata_info: Optional[str] = None
