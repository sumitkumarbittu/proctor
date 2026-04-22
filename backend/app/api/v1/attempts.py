from typing import Any, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.user import User
from app.models.exam import Exam, Question
from app.models.attempt import Attempt, AttemptStatus, Response, ProctoringLog, Result
from app.schemas.attempt import AttemptCreate, Attempt as AttemptSchema, ResponseCreate, ProctorLogCreate

router = APIRouter()

@router.get("/{attempt_id}", response_model=AttemptSchema)
async def read_attempt(
    attempt_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get attempt by ID.
    """
    result = await db.execute(select(Attempt).options(selectinload(Attempt.result)).filter(Attempt.id == attempt_id))
    attempt = result.scalars().first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if attempt.student_id != current_user.id and current_user.role not in ['admin', 'examiner']:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return attempt

@router.get("/", response_model=List[AttemptSchema])
async def read_attempts_me(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Get all attempts for current user (or all if admin - simplistic).
    """
    if current_user.role in ['admin', 'examiner']:
         result = await db.execute(select(Attempt).offset(skip).limit(limit))
    else:
         result = await db.execute(select(Attempt).filter(Attempt.student_id == current_user.id).offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/exam/{exam_id}", response_model=List[AttemptSchema])
async def read_attempts_for_exam(
    exam_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get all attempts for a specific exam (admin/examiner).
    """
    result = await db.execute(
        select(Attempt)
        .options(selectinload(Attempt.result), selectinload(Attempt.student))
        .filter(Attempt.exam_id == exam_id)
        .offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.get("/{attempt_id}/logs")
async def read_proctoring_logs(
    attempt_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """
    Get proctoring logs for an attempt (admin/examiner only).
    """
    result = await db.execute(
        select(ProctoringLog)
        .filter(ProctoringLog.attempt_id == attempt_id)
        .order_by(ProctoringLog.created_at.asc())
    )
    logs = result.scalars().all()
    return [
        {
            "id": log.id,
            "event_type": log.event_type,
            "severity": log.severity,
            "metadata_info": log.metadata_info,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]


@router.get("/{attempt_id}/responses")
async def read_attempt_responses(
    attempt_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all responses for an attempt.
    """
    attempt_result = await db.execute(select(Attempt).filter(Attempt.id == attempt_id))
    attempt = attempt_result.scalars().first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    if attempt.student_id != current_user.id and current_user.role not in ['admin', 'examiner']:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    result = await db.execute(
        select(Response)
        .options(selectinload(Response.question))
        .filter(Response.attempt_id == attempt_id)
    )
    responses = result.scalars().all()
    return [
        {
            "id": r.id,
            "question_id": r.question_id,
            "answer": r.answer,
            "marks_awarded": r.marks_awarded,
            "question_prompt": r.question.prompt if r.question else "",
            "question_type": r.question.type if r.question else "",
            "correct_option": r.question.correct_option if r.question else None,
            "max_marks": r.question.marks if r.question else 0,
        }
        for r in responses
    ]


@router.post("/{exam_id}/start", response_model=AttemptSchema)
async def start_attempt(
    exam_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Start an exam attempt.
    """
    # Check if existing attempt exists
    result = await db.execute(select(Attempt).filter(Attempt.exam_id == exam_id, Attempt.student_id == current_user.id))
    existing_attempt = result.scalars().first()
    
    if existing_attempt:
        return existing_attempt

    # Create new attempt
    attempt = Attempt(
        exam_id=exam_id,
        student_id=current_user.id,
        status=AttemptStatus.IN_PROGRESS
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    return attempt

@router.post("/{attempt_id}/response")
async def save_response(
    attempt_id: int,
    response: ResponseCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Save a response to a question. (Auto-save)
    """
    # Check ownership
    result = await db.execute(select(Attempt).filter(Attempt.id == attempt_id, Attempt.student_id == current_user.id))
    attempt = result.scalars().first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
        
    if attempt.status != AttemptStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Exam already submitted")

    # Upsert response
    res_result = await db.execute(select(Response).filter(Response.attempt_id == attempt_id, Response.question_id == response.question_id))
    existing_response = res_result.scalars().first()
    
    if existing_response:
        existing_response.answer = response.answer
    else:
        new_response = Response(
            attempt_id=attempt_id,
            question_id=response.question_id,
            answer=response.answer
        )
        db.add(new_response)
    
    await db.commit()
    return {"status": "saved"}

@router.post("/{attempt_id}/submit")
async def submit_attempt(
    attempt_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Submit the exam.
    """
    result = await db.execute(select(Attempt).filter(Attempt.id == attempt_id, Attempt.student_id == current_user.id))
    attempt = result.scalars().first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
        
    attempt.status = AttemptStatus.SUBMITTED
    attempt.submitted_at = datetime.utcnow()
    await db.commit()
    
    return {"status": "submitted"}

@router.post("/{attempt_id}/log")
async def log_proctoring_event(
    attempt_id: int,
    log: ProctorLogCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Log a proctoring event (tab switch, etc).
    """
    # Check attempt ownership
    result = await db.execute(select(Attempt).filter(Attempt.id == attempt_id, Attempt.student_id == current_user.id))
    attempt = result.scalars().first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    new_log = ProctoringLog(
        attempt_id=attempt_id,
        event_type=log.event_type,
        metadata_info=log.metadata_info
    )
    db.add(new_log)
    await db.commit()
    return {"status": "logged"}

@router.post("/{attempt_id}/evaluate")
async def evaluate_attempt(
    attempt_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """
    Evaluate attempt (Examiner only). 
    Auto-grades MCQs.
    """
    # Fetch attempt with responses and questions
    result = await db.execute(select(Attempt).options(selectinload(Attempt.responses)).filter(Attempt.id == attempt_id))
    attempt = result.scalars().first()
    if not attempt:
         raise HTTPException(status_code=404, detail="Attempt not found")

    total_score = 0.0
    max_score = 0.0

    # Iterate responses
    for response in attempt.responses:
        # Load question
        q_res = await db.execute(select(Question).filter(Question.id == response.question_id))
        question = q_res.scalars().first()
        if question:
            max_score += question.marks
            if question.type == "MCQ" and question.correct_option == response.answer:
                response.marks_awarded = question.marks
                total_score += question.marks
            # Subjective manual grading needed
            db.add(response)

    # Create/Update Result
    res_q = await db.execute(select(Result).filter(Result.attempt_id == attempt_id))
    existing_result = res_q.scalars().first()
    
    if existing_result:
        existing_result.total_score = total_score
        existing_result.max_score = max_score
    else:
        new_result = Result(
            attempt_id=attempt_id,
            total_score=total_score,
            max_score=max_score
        )
        db.add(new_result)
    
    attempt.status = AttemptStatus.EVALUATED
    await db.commit()
    
    return {"status": "evaluated", "score": total_score, "max_score": max_score}


@router.post("/{attempt_id}/grade-response")
async def grade_subjective_response(
    attempt_id: int,
    response_id: int,
    marks: float,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """
    Manually grade a subjective response.
    """
    result = await db.execute(
        select(Response).filter(Response.id == response_id, Response.attempt_id == attempt_id)
    )
    response = result.scalars().first()
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")

    # Validate marks
    q_res = await db.execute(select(Question).filter(Question.id == response.question_id))
    question = q_res.scalars().first()
    if question and marks > question.marks:
        raise HTTPException(status_code=400, detail=f"Marks cannot exceed {question.marks}")

    response.marks_awarded = marks
    await db.commit()
    return {"status": "graded", "marks_awarded": marks}
