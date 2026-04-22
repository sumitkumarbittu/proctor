from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.user import User
from app.models.exam import Exam, Question, ExamQuestion, QuestionType, ExamStatus, Assignment
from app.schemas.exam import (
    Exam as ExamSchema, ExamCreate, ExamUpdate,
    QuestionCreate, QuestionUpdate, Question as QuestionSchema,
    ExamAssign
)

router = APIRouter()

# --- Questions ---

@router.post("/questions", response_model=QuestionSchema)
async def create_question(
    *,
    db: AsyncSession = Depends(deps.get_db),
    question_in: QuestionCreate,
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """
    Create new question (Examiner only).
    """
    question = Question(
        type=question_in.type,
        prompt=question_in.prompt,
        options=question_in.options,
        correct_option=question_in.correct_option,
        marks=question_in.marks,
        created_by=current_user.id
    )
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question

@router.get("/questions", response_model=List[QuestionSchema])
async def read_questions(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Get all questions.
    """
    result = await db.execute(select(Question).offset(skip).limit(limit))
    return result.scalars().all()


@router.put("/questions/{question_id}", response_model=QuestionSchema)
async def update_question(
    question_id: int,
    question_in: QuestionUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """
    Update a question (Examiner only).
    """
    result = await db.execute(select(Question).filter(Question.id == question_id))
    question = result.scalars().first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    if question_in.prompt is not None:
        question.prompt = question_in.prompt
    if question_in.type is not None:
        question.type = question_in.type
    if question_in.options is not None:
        question.options = question_in.options
    if question_in.correct_option is not None:
        question.correct_option = question_in.correct_option
    if question_in.marks is not None:
        question.marks = question_in.marks

    await db.commit()
    await db.refresh(question)
    return question


@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """
    Delete a question.
    """
    result = await db.execute(select(Question).filter(Question.id == question_id))
    question = result.scalars().first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Remove from exam associations first
    await db.execute(delete(ExamQuestion).where(ExamQuestion.question_id == question_id))
    await db.delete(question)
    await db.commit()
    return {"status": "deleted", "id": question_id}


# --- Exams ---

@router.post("/", response_model=ExamSchema)
async def create_exam(
    *,
    db: AsyncSession = Depends(deps.get_db),
    exam_in: ExamCreate,
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """
    Create new exam.
    """
    exam = Exam(
        title=exam_in.title,
        instructions=exam_in.instructions,
        start_time=exam_in.start_time,
        duration_minutes=exam_in.duration_minutes,
        status=exam_in.status,
        created_by=current_user.id
    )
    db.add(exam)
    await db.commit()
    await db.refresh(exam)
    return exam

@router.get("/", response_model=List[ExamSchema])
async def read_exams(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Get exams (filtered by permissions later, currently simple).
    """
    # Fix: User should see exams assigned to them or created by them
    # For simplicity, returning all for now, filter logic can be added
    result = await db.execute(select(Exam).options(selectinload(Exam.questions)).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{exam_id}", response_model=ExamSchema)
async def read_exam(
    exam_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get exam by ID.
    """
    result = await db.execute(select(Exam).options(selectinload(Exam.questions).selectinload(ExamQuestion.question)).filter(Exam.id == exam_id))
    exam = result.scalars().first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
        
    # Security: If user is student, strip correct answers from questions
    # But schema handles response model. We might need a separate schema for student taking exam
    # For now, simplistic approach
    
    return exam


@router.put("/{exam_id}", response_model=ExamSchema)
async def update_exam(
    exam_id: int,
    exam_in: ExamUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """
    Update an exam (Examiner only).
    """
    result = await db.execute(select(Exam).filter(Exam.id == exam_id))
    exam = result.scalars().first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    if exam_in.title is not None:
        exam.title = exam_in.title
    if exam_in.instructions is not None:
        exam.instructions = exam_in.instructions
    if exam_in.duration_minutes is not None:
        exam.duration_minutes = exam_in.duration_minutes
    if exam_in.start_time is not None:
        exam.start_time = exam_in.start_time
    if exam_in.status is not None:
        exam.status = exam_in.status

    await db.commit()
    await db.refresh(exam)
    return exam


@router.delete("/{exam_id}")
async def delete_exam(
    exam_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """
    Delete an exam and all associations.
    """
    result = await db.execute(select(Exam).filter(Exam.id == exam_id))
    exam = result.scalars().first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    await db.delete(exam)
    await db.commit()
    return {"status": "deleted", "id": exam_id}


@router.post("/{exam_id}/questions/{question_id}")
async def add_question_to_exam(
    exam_id: int,
    question_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """
    Add question to exam.
    """
    # Check if already added
    result = await db.execute(
        select(ExamQuestion).filter(
            ExamQuestion.exam_id == exam_id,
            ExamQuestion.question_id == question_id
        )
    )
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Question already in exam")

    # Get the next order index
    order_result = await db.execute(
        select(ExamQuestion).filter(ExamQuestion.exam_id == exam_id)
    )
    existing = order_result.scalars().all()
    next_order = len(existing)

    exam_q = ExamQuestion(exam_id=exam_id, question_id=question_id, order_index=next_order)
    db.add(exam_q)
    await db.commit()
    return {"status": "added"}


@router.delete("/{exam_id}/questions/{question_id}")
async def remove_question_from_exam(
    exam_id: int,
    question_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """
    Remove question from exam.
    """
    result = await db.execute(
        select(ExamQuestion).filter(
            ExamQuestion.exam_id == exam_id,
            ExamQuestion.question_id == question_id
        )
    )
    eq = result.scalars().first()
    if not eq:
        raise HTTPException(status_code=404, detail="Question not in exam")

    await db.delete(eq)
    await db.commit()
    return {"status": "removed"}


@router.post("/{exam_id}/assign")
async def assign_students(
    exam_id: int,
    data: ExamAssign,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """
    Assign students to an exam.
    """
    # Verify exam exists
    result = await db.execute(select(Exam).filter(Exam.id == exam_id))
    exam = result.scalars().first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    assigned = []
    for sid in data.student_ids:
        # Check if already assigned
        check = await db.execute(
            select(Assignment).filter(
                Assignment.exam_id == exam_id,
                Assignment.student_id == sid
            )
        )
        if not check.scalars().first():
            assignment = Assignment(exam_id=exam_id, student_id=sid)
            db.add(assignment)
            assigned.append(sid)

    await db.commit()
    return {"status": "assigned", "student_ids": assigned}


@router.put("/{exam_id}/status")
async def update_exam_status(
    exam_id: int,
    status_update: dict,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """
    Update exam status (DRAFT, SCHEDULED, LIVE, CLOSED, RESULT_PUBLISHED).
    """
    result = await db.execute(select(Exam).filter(Exam.id == exam_id))
    exam = result.scalars().first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    new_status = status_update.get("status")
    if new_status:
        try:
            exam.status = ExamStatus(new_status)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {new_status}")

    await db.commit()
    return {"status": exam.status}
