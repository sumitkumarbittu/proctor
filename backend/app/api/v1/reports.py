from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.user import User
from app.models.exam import Exam
from app.models.attempt import Attempt, AttemptStatus, Result, ProctoringLog

router = APIRouter()

@router.get("/exam/{exam_id}/summary")
async def get_exam_summary(
    exam_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """
    Get summary report for an exam.
    """
    # Total attempts
    attempts_res = await db.execute(select(func.count(Attempt.id)).filter(Attempt.exam_id == exam_id))
    total_attempts = attempts_res.scalar()

    # Submitted
    submitted_res = await db.execute(
        select(func.count(Attempt.id)).filter(
            Attempt.exam_id == exam_id,
            Attempt.status.in_([AttemptStatus.SUBMITTED, AttemptStatus.EVALUATED])
        )
    )
    total_submitted = submitted_res.scalar()

    # Evaluated
    evaluated_res = await db.execute(
        select(func.count(Attempt.id)).filter(
            Attempt.exam_id == exam_id,
            Attempt.status == AttemptStatus.EVALUATED
        )
    )
    total_evaluated = evaluated_res.scalar()

    # Average score
    avg_score_res = await db.execute(
        select(func.avg(Result.total_score))
        .join(Attempt, Result.attempt_id == Attempt.id)
        .filter(Attempt.exam_id == exam_id)
    )
    avg_score = avg_score_res.scalar() or 0.0

    # Max / Min score
    max_score_res = await db.execute(
        select(func.max(Result.total_score))
        .join(Attempt, Result.attempt_id == Attempt.id)
        .filter(Attempt.exam_id == exam_id)
    )
    max_score = max_score_res.scalar() or 0.0

    min_score_res = await db.execute(
        select(func.min(Result.total_score))
        .join(Attempt, Result.attempt_id == Attempt.id)
        .filter(Attempt.exam_id == exam_id)
    )
    min_score = min_score_res.scalar() or 0.0

    # Total proctoring violations
    violations_res = await db.execute(
        select(func.count(ProctoringLog.id))
        .join(Attempt, ProctoringLog.attempt_id == Attempt.id)
        .filter(Attempt.exam_id == exam_id)
    )
    total_violations = violations_res.scalar()

    return {
        "exam_id": exam_id,
        "total_attempts": total_attempts,
        "total_submitted": total_submitted,
        "total_evaluated": total_evaluated,
        "average_score": round(avg_score, 2),
        "max_score": max_score,
        "min_score": min_score,
        "total_proctoring_violations": total_violations,
    }


@router.get("/dashboard")
async def get_admin_dashboard(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """
    Get admin dashboard stats.
    """
    # Total exams
    exams_res = await db.execute(select(func.count(Exam.id)))
    total_exams = exams_res.scalar()

    # Total users
    users_res = await db.execute(select(func.count(User.id)))
    total_users = users_res.scalar()

    # Total attempts
    attempts_res = await db.execute(select(func.count(Attempt.id)))
    total_attempts = attempts_res.scalar()

    # Pending evaluation
    pending_res = await db.execute(
        select(func.count(Attempt.id)).filter(Attempt.status == AttemptStatus.SUBMITTED)
    )
    pending_evaluation = pending_res.scalar()

    # Live exams
    from app.models.exam import ExamStatus
    live_res = await db.execute(
        select(func.count(Exam.id)).filter(Exam.status == ExamStatus.LIVE)
    )
    live_exams = live_res.scalar()

    return {
        "total_exams": total_exams,
        "total_users": total_users,
        "total_attempts": total_attempts,
        "pending_evaluation": pending_evaluation,
        "live_exams": live_exams,
    }
