from datetime import datetime
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.attempt import Attempt, AttemptStatus, ProctoringLog, Response, Result
from app.models.exam import Assignment, Exam, ExamQuestion, ExamStatus, Question, TeacherAssignment
from app.models.trash import TrashedItem, TrashEntityType
from app.models.user import User, UserRole
from app.schemas.attempt import Attempt as AttemptSchema
from app.schemas.attempt import ProctorLogCreate, ResponseCreate

router = APIRouter()


def _has_exam_staff_access(exam: Exam | None, current_user: User) -> bool:
    if not exam:
        return False
    if current_user.role == UserRole.ADMIN:
        return True
    if current_user.role != UserRole.EXAMINER:
        return False
    if exam.created_by == current_user.id:
        return True
    return any(
        assignment.teacher_id == current_user.id for assignment in exam.teacher_assignments
    )


async def _get_attempt_or_404(db: AsyncSession, attempt_id: int) -> Attempt:
    result = await db.execute(
        select(Attempt)
        .options(
            selectinload(Attempt.result),
            selectinload(Attempt.student),
            selectinload(Attempt.responses),
            selectinload(Attempt.logs),
            selectinload(Attempt.exam).selectinload(Exam.teacher_assignments),
            selectinload(Attempt.exam).selectinload(Exam.questions).selectinload(ExamQuestion.question),
        )
        .filter(Attempt.id == attempt_id)
    )
    attempt = result.scalars().unique().first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return attempt


def _ensure_attempt_access(attempt: Attempt, current_user: User) -> None:
    if attempt.student_id == current_user.id:
        return
    if _has_exam_staff_access(attempt.exam, current_user):
        return
    raise HTTPException(status_code=403, detail="Not enough permissions")


def _ensure_exam_staff_for_attempt(attempt: Attempt, current_user: User) -> None:
    if not _has_exam_staff_access(attempt.exam, current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")


def _snapshot_attempt(attempt: Attempt) -> dict[str, Any]:
    return jsonable_encoder(
        {
            "id": attempt.id,
            "exam_id": attempt.exam_id,
            "student_id": attempt.student_id,
            "status": attempt.status,
            "started_at": attempt.started_at,
            "submitted_at": attempt.submitted_at,
            "exam_access": {
                "created_by": attempt.exam.created_by if attempt.exam else None,
                "teacher_ids": [
                    assignment.teacher_id for assignment in (attempt.exam.teacher_assignments if attempt.exam else [])
                ],
            },
            "responses": [
                {
                    "id": response.id,
                    "question_id": response.question_id,
                    "answer": response.answer,
                    "marks_awarded": response.marks_awarded,
                }
                for response in attempt.responses
            ],
            "logs": [
                {
                    "id": log.id,
                    "event_type": log.event_type,
                    "severity": log.severity,
                    "metadata_info": log.metadata_info,
                    "created_at": log.created_at,
                }
                for log in attempt.logs
            ],
            "result": (
                {
                    "id": attempt.result.id,
                    "total_score": attempt.result.total_score,
                    "max_score": attempt.result.max_score,
                    "published_at": attempt.result.published_at,
                }
                if attempt.result
                else None
            ),
        }
    )


@router.get("/{attempt_id}", response_model=AttemptSchema)
async def read_attempt(
    attempt_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    attempt = await _get_attempt_or_404(db, attempt_id)
    _ensure_attempt_access(attempt, current_user)
    return attempt


@router.get("/", response_model=List[AttemptSchema])
async def read_attempts_me(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    stmt = select(Attempt).options(selectinload(Attempt.result), selectinload(Attempt.student))

    if current_user.role == UserRole.ADMIN:
        stmt = stmt.order_by(Attempt.started_at.desc())
    elif current_user.role == UserRole.EXAMINER:
        assigned_teacher_exists = (
            select(TeacherAssignment.exam_id)
            .filter(
                TeacherAssignment.exam_id == Attempt.exam_id,
                TeacherAssignment.teacher_id == current_user.id,
            )
            .exists()
        )
        stmt = (
            stmt.join(Exam, Exam.id == Attempt.exam_id)
            .filter(or_(Exam.created_by == current_user.id, assigned_teacher_exists))
            .order_by(Attempt.started_at.desc())
        )
    else:
        stmt = stmt.filter(Attempt.student_id == current_user.id).order_by(Attempt.started_at.desc())

    result = await db.execute(stmt.offset(skip).limit(limit))
    return result.scalars().unique().all()


@router.get("/exam/{exam_id}", response_model=List[AttemptSchema])
async def read_attempts_for_exam(
    exam_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    exam_result = await db.execute(
        select(Exam).options(selectinload(Exam.teacher_assignments)).filter(Exam.id == exam_id)
    )
    exam = exam_result.scalars().unique().first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    if not _has_exam_staff_access(exam, current_user):
        raise HTTPException(status_code=403, detail="Exam is not available to this teacher")

    result = await db.execute(
        select(Attempt)
        .options(selectinload(Attempt.result), selectinload(Attempt.student))
        .filter(Attempt.exam_id == exam_id)
        .order_by(Attempt.started_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().unique().all()


@router.get("/{attempt_id}/logs")
async def read_proctoring_logs(
    attempt_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    attempt = await _get_attempt_or_404(db, attempt_id)
    _ensure_exam_staff_for_attempt(attempt, current_user)

    return [
        {
            "id": log.id,
            "event_type": log.event_type,
            "severity": log.severity,
            "metadata_info": log.metadata_info,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in sorted(attempt.logs, key=lambda item: item.created_at or datetime.min)
    ]


@router.get("/{attempt_id}/responses")
async def read_attempt_responses(
    attempt_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    attempt = await _get_attempt_or_404(db, attempt_id)
    _ensure_attempt_access(attempt, current_user)
    can_view_answer_key = current_user.role in [UserRole.ADMIN, UserRole.EXAMINER] or attempt.status == AttemptStatus.EVALUATED

    question_ids = [response.question_id for response in attempt.responses]
    question_map: dict[int, Question] = {}
    if question_ids:
        question_result = await db.execute(
            select(Question).filter(Question.id.in_(question_ids))
        )
        question_map = {question.id: question for question in question_result.scalars().all()}

    return [
        {
            "id": response.id,
            "question_id": response.question_id,
            "answer": response.answer,
            "marks_awarded": response.marks_awarded,
            "question_prompt": question_map.get(response.question_id).prompt
            if question_map.get(response.question_id)
            else "",
            "question_type": question_map.get(response.question_id).type
            if question_map.get(response.question_id)
            else "",
            "correct_option": question_map.get(response.question_id).correct_option
            if question_map.get(response.question_id) and can_view_answer_key
            else None,
            "max_marks": question_map.get(response.question_id).marks
            if question_map.get(response.question_id)
            else 0,
        }
        for response in attempt.responses
    ]


@router.delete("/{attempt_id}")
async def delete_attempt(
    attempt_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    attempt = await _get_attempt_or_404(db, attempt_id)
    _ensure_exam_staff_for_attempt(attempt, current_user)

    db.add(
        TrashedItem(
            entity_type=TrashEntityType.ATTEMPT,
            original_id=attempt.id,
            label=f"Submission #{attempt.id}",
            snapshot=_snapshot_attempt(attempt),
            deleted_by=current_user.id,
        )
    )

    if attempt.result:
        await db.delete(attempt.result)
    for response in list(attempt.responses):
        await db.delete(response)
    for log in list(attempt.logs):
        await db.delete(log)
    await db.delete(attempt)
    await db.commit()
    return {"status": "deleted", "id": attempt_id}


@router.post("/{exam_id}/start", response_model=AttemptSchema)
async def start_attempt(
    exam_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can start an exam attempt")

    exam_result = await db.execute(select(Exam).filter(Exam.id == exam_id))
    exam = exam_result.scalars().first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    existing_attempt_result = await db.execute(
        select(Attempt)
        .options(selectinload(Attempt.result), selectinload(Attempt.student))
        .filter(Attempt.exam_id == exam_id, Attempt.student_id == current_user.id)
    )
    existing_attempt = existing_attempt_result.scalars().unique().first()
    if existing_attempt:
        return existing_attempt

    assignment_result = await db.execute(
        select(Assignment).filter(
            Assignment.exam_id == exam_id,
            Assignment.student_id == current_user.id,
        )
    )
    assignment = assignment_result.scalars().first()
    if not assignment:
        raise HTTPException(status_code=403, detail="Exam is not assigned to this student")

    if exam.status != ExamStatus.LIVE:
        raise HTTPException(status_code=400, detail="Exam is not live")

    question_result = await db.execute(
        select(ExamQuestion).filter(ExamQuestion.exam_id == exam_id).limit(1)
    )
    if question_result.scalars().first() is None:
        raise HTTPException(status_code=400, detail="Exam does not have any questions")

    attempt = Attempt(
        exam_id=exam_id,
        student_id=current_user.id,
        status=AttemptStatus.IN_PROGRESS,
    )
    db.add(attempt)
    await db.commit()
    attempt = await _get_attempt_or_404(db, attempt.id)
    return attempt


@router.post("/{attempt_id}/response")
async def save_response(
    attempt_id: int,
    response: ResponseCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    attempt = await _get_attempt_or_404(db, attempt_id)
    if attempt.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    if attempt.status != AttemptStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Exam already submitted")

    question_link_result = await db.execute(
        select(ExamQuestion).filter(
            ExamQuestion.exam_id == attempt.exam_id,
            ExamQuestion.question_id == response.question_id,
        )
    )
    if question_link_result.scalars().first() is None:
        raise HTTPException(status_code=400, detail="Question is no longer part of this exam")

    existing_response_result = await db.execute(
        select(Response).filter(
            Response.attempt_id == attempt_id,
            Response.question_id == response.question_id,
        )
    )
    existing_response = existing_response_result.scalars().first()

    if existing_response:
        existing_response.answer = response.answer
    else:
        db.add(
            Response(
                attempt_id=attempt_id,
                question_id=response.question_id,
                answer=response.answer,
            )
        )

    await db.commit()
    return {"status": "saved"}


@router.post("/{attempt_id}/submit")
async def submit_attempt(
    attempt_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    attempt = await _get_attempt_or_404(db, attempt_id)
    if attempt.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    if attempt.status != AttemptStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Attempt is already completed")

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
    attempt = await _get_attempt_or_404(db, attempt_id)
    if attempt.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    db.add(
        ProctoringLog(
            attempt_id=attempt_id,
            event_type=log.event_type,
            metadata_info=log.metadata_info,
        )
    )
    await db.commit()
    return {"status": "logged"}


@router.post("/{attempt_id}/evaluate")
async def evaluate_attempt(
    attempt_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    attempt = await _get_attempt_or_404(db, attempt_id)
    _ensure_exam_staff_for_attempt(attempt, current_user)

    question_map = {
        exam_question.question_id: exam_question.question
        for exam_question in attempt.exam.questions
        if exam_question.question
    }

    total_score = 0.0
    max_score = 0.0

    for response in attempt.responses:
        if response.question_id not in question_map:
            response.marks_awarded = 0.0

    for question_id, question in question_map.items():
        max_score += question.marks
        response = next(
            (item for item in attempt.responses if item.question_id == question_id),
            None,
        )
        if not response:
            continue

        if question.type.value == "MCQ":
            response.marks_awarded = question.marks if question.correct_option == response.answer else 0.0

        total_score += response.marks_awarded or 0.0

    result = attempt.result
    if result:
        result.total_score = total_score
        result.max_score = max_score
    else:
        db.add(
            Result(
                attempt_id=attempt_id,
                total_score=total_score,
                max_score=max_score,
            )
        )

    attempt.status = AttemptStatus.EVALUATED
    await db.commit()

    return {"status": "evaluated", "score": total_score, "max_score": max_score}
