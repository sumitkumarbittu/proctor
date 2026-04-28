from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.models.exam import ExamStatus, QuestionType
from app.models.user import UserRole


class UserPreview(BaseModel):
    id: int
    name: Optional[str] = None
    email: str
    role: UserRole

    class Config:
        from_attributes = True


class QuestionFolderBase(BaseModel):
    name: str
    description: Optional[str] = None


class QuestionFolderCreate(QuestionFolderBase):
    share_with_teacher_ids: List[int] = []


class QuestionFolderUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    share_with_teacher_ids: Optional[List[int]] = None


class QuestionFolder(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner: Optional[UserPreview] = None
    shared_with: List[UserPreview] = []
    access_level: str = "owner"
    question_count: int = 0
    can_edit: bool = False
    can_delete: bool = False
    can_share: bool = False

    class Config:
        from_attributes = True


class QuestionBase(BaseModel):
    type: QuestionType
    prompt: str
    options: Optional[List[str]] = None
    marks: int = 1
    folder_id: Optional[int] = None


class QuestionCreate(QuestionBase):
    correct_option: Optional[str] = None


class QuestionUpdate(BaseModel):
    type: Optional[QuestionType] = None
    prompt: Optional[str] = None
    options: Optional[List[str]] = None
    correct_option: Optional[str] = None
    marks: Optional[int] = None
    folder_id: Optional[int] = None


class Question(BaseModel):
    id: int
    type: QuestionType
    prompt: str
    options: Optional[List[str]] = None
    correct_option: Optional[str] = None
    marks: int = 1
    folder_id: Optional[int] = None
    created_by: Optional[int] = None
    created_at: datetime
    folder: Optional[QuestionFolder] = None
    owner: Optional[UserPreview] = None
    can_edit: bool = False
    can_delete: bool = False

    class Config:
        from_attributes = True


class ExamQuestionBase(BaseModel):
    question_id: int
    order_index: int


class ExamQuestion(ExamQuestionBase):
    question: Question

    class Config:
        from_attributes = True


class StudentAssignment(BaseModel):
    exam_id: int
    student_id: int
    student: Optional[UserPreview] = None

    class Config:
        from_attributes = True


class TeacherAssignment(BaseModel):
    exam_id: int
    teacher_id: int
    assigned_at: Optional[datetime] = None
    teacher: Optional[UserPreview] = None

    class Config:
        from_attributes = True


class ExamBase(BaseModel):
    title: str
    instructions: Optional[str] = None
    duration_minutes: int
    max_attempts_per_student: int = 1
    password_required: bool = True
    start_time: Optional[datetime] = None
    status: ExamStatus = ExamStatus.DRAFT


class ExamCreate(ExamBase):
    password: Optional[str] = None


class ExamUpdate(BaseModel):
    title: Optional[str] = None
    instructions: Optional[str] = None
    duration_minutes: Optional[int] = None
    max_attempts_per_student: Optional[int] = None
    password_required: Optional[bool] = None
    start_time: Optional[datetime] = None
    status: Optional[ExamStatus] = None
    password: Optional[str] = None


class Exam(BaseModel):
    id: int
    title: str
    instructions: Optional[str] = None
    duration_minutes: int
    max_attempts_per_student: int = 1
    password_required: bool = True
    start_time: Optional[datetime] = None
    status: ExamStatus
    requires_password: bool = False
    can_manage_schedule: bool = False
    can_manage_timer: bool = False
    can_manage_password: bool = False
    question_count: int = 0
    attempt_count: int = 0
    in_progress_attempt_count: int = 0
    submitted_attempt_count: int = 0
    evaluated_attempt_count: int = 0
    student_attempt_count: int = 0
    student_attempt_id: Optional[int] = None
    student_attempt_status: Optional[str] = None
    student_attempt_started_at: Optional[datetime] = None
    student_attempt_submitted_at: Optional[datetime] = None
    schedule_updated_at: Optional[datetime] = None
    schedule_updated_by: Optional[int] = None
    created_by: int
    created_at: datetime
    creator: Optional[UserPreview] = None
    questions: List[ExamQuestion] = []
    assignments: List[StudentAssignment] = []
    teacher_assignments: List[TeacherAssignment] = []

    class Config:
        from_attributes = True


class ExamAssign(BaseModel):
    student_ids: List[int] = []
    teacher_ids: List[int] = []
