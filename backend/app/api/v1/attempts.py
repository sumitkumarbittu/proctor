from datetime import datetime, timedelta
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api import deps
from app.core import security
from app.models.attempt import Attempt, AttemptStatus, ProctoringLog, Response, Result
from app.models.exam import Assignment, Exam, ExamQuestion, ExamStatus, Question, TeacherAssignment
from app.models.trash import TrashedItem, TrashEntityType
from app.models.user import User, UserRole
from app.schemas.attempt import Attempt as AttemptSchema
from app.schemas.attempt import AttemptStartRequest, AttemptStartResponse, ProctorLogCreate, ResponseCreate

router = APIRouter()


def _utcnow() -> datetime:
    return datetime.utcnow()


def _get_exam_availability_close_time(exam: Exam) -> datetime | None:
    if not exam.start_time:
        return None

    # The current product model only stores a start_time plus exam duration.
    # We therefore treat start_time + duration_minutes as the latest valid first-open window.
    return exam.start_time + timedelta(minutes=max(exam.duration_minutes, 0))


def _ensure_attempt_timing(attempt: Attempt) -> bool:
    updated = False
    started_at = attempt.started_at or _utcnow()
    duration_minutes = max(attempt.exam.duration_minutes if attempt.exam else 0, 0)

    if attempt.ends_at is None:
        attempt.ends_at = started_at + timedelta(minutes=duration_minutes)
        updated = True
    if attempt.last_opened_at is None:
        attempt.last_opened_at = started_at
        updated = True

    return updated


async def _sync_attempt_state(
    db: AsyncSession,
    attempt: Attempt,
    *,
    now: datetime | None = None,
    commit: bool,
) -> bool:
    current_time = now or _utcnow()
    updated = _ensure_attempt_timing(attempt)

    if (
        attempt.status == AttemptStatus.IN_PROGRESS
        and attempt.ends_at is not None
        and current_time >= attempt.ends_at
    ):
        attempt.status = AttemptStatus.SUBMITTED
        attempt.submitted_at = attempt.submitted_at or attempt.ends_at
        updated = True

    if updated:
        if commit:
            await db.commit()
        else:
            await db.flush()

    return updated


def _remaining_seconds(attempt: Attempt, now: datetime | None = None) -> int:
    if not attempt.ends_at:
        return 0
    current_time = now or _utcnow()
    return max(0, int((attempt.ends_at - current_time).total_seconds()))


def _serialize_attempt(attempt: Attempt, now: datetime | None = None) -> dict[str, Any]:
    current_time = now or _utcnow()
    return {
        "id": attempt.id,
        "exam_id": attempt.exam_id,
        "student_id": attempt.student_id,
        "status": attempt.status,
        "started_at": attempt.started_at,
        "ends_at": attempt.ends_at,
        "last_opened_at": attempt.last_opened_at,
        "submitted_at": attempt.submitted_at,
        "remaining_seconds": _remaining_seconds(attempt, current_time),
        "server_time": current_time,
        "student": attempt.student,
        "result": attempt.result,
    }


def _ensure_exam_access_token(
    request: Request,
    *,
    attempt: Attempt,
    current_user: User,
) -> None:
    # Exam access is persisted through the authenticated server session and
    # attempt ownership. No browser-side exam token is required.
    return


def _exam_requires_password(exam: Exam) -> bool:
    return bool(exam.password_required is not False and exam.password_hash)


def _verify_exam_password(exam: Exam, password: str | None) -> None:
    if not _exam_requires_password(exam):
        return
    if not password or not security.verify_password(password, exam.password_hash):
        raise HTTPException(status_code=403, detail="Incorrect exam password")


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
    _ensure_attempt_timing(attempt)
    return jsonable_encoder(
        {
            "id": attempt.id,
            "exam_id": attempt.exam_id,
            "student_id": attempt.student_id,
            "status": attempt.status,
            "started_at": attempt.started_at,
            "ends_at": attempt.ends_at,
            "last_opened_at": attempt.last_opened_at,
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
    request: Request,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    attempt = await _get_attempt_or_404(db, attempt_id)
    _ensure_attempt_access(attempt, current_user)
    await _sync_attempt_state(db, attempt, commit=True)
    _ensure_exam_access_token(request, attempt=attempt, current_user=current_user)
    return _serialize_attempt(attempt)


@router.get("/", response_model=List[AttemptSchema])
async def read_attempts_me(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    stmt = select(Attempt).options(
        selectinload(Attempt.result),
        selectinload(Attempt.student),
        selectinload(Attempt.exam),
    )

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
    attempts = result.scalars().unique().all()
    changed = False
    current_time = _utcnow()
    for attempt in attempts:
        changed = await _sync_attempt_state(
            db,
            attempt,
            now=current_time,
            commit=False,
        ) or changed
    if changed:
        await db.commit()
    return [_serialize_attempt(attempt, current_time) for attempt in attempts]


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
        .options(
            selectinload(Attempt.result),
            selectinload(Attempt.student),
            selectinload(Attempt.exam),
        )
        .filter(Attempt.exam_id == exam_id)
        .order_by(Attempt.started_at.desc())
        .offset(skip)
        .limit(limit)
    )
    attempts = result.scalars().unique().all()
    changed = False
    current_time = _utcnow()
    for attempt in attempts:
        changed = await _sync_attempt_state(
            db,
            attempt,
            now=current_time,
            commit=False,
        ) or changed
    if changed:
        await db.commit()
    return [_serialize_attempt(attempt, current_time) for attempt in attempts]


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
    request: Request,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    attempt = await _get_attempt_or_404(db, attempt_id)
    _ensure_attempt_access(attempt, current_user)
    await _sync_attempt_state(db, attempt, commit=True)
    _ensure_exam_access_token(request, attempt=attempt, current_user=current_user)
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


@router.post("/{exam_id}/start", response_model=AttemptStartResponse)
async def start_attempt(
    exam_id: int,
    start_request: AttemptStartRequest,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can start an exam attempt")

    current_time = _utcnow()
    exam_result = await db.execute(select(Exam).filter(Exam.id == exam_id))
    exam = exam_result.scalars().first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    existing_attempt_result = await db.execute(
        select(Attempt)
        .options(
            selectinload(Attempt.result),
            selectinload(Attempt.student),
            selectinload(Attempt.exam),
        )
        .filter(Attempt.exam_id == exam_id, Attempt.student_id == current_user.id)
        .order_by(Attempt.started_at.desc(), Attempt.id.desc())
    )
    existing_attempts = existing_attempt_result.scalars().unique().all()
    existing_attempt = existing_attempts[0] if existing_attempts else None
    if existing_attempt:
        await _sync_attempt_state(db, existing_attempt, now=current_time, commit=True)
        if existing_attempt.status == AttemptStatus.IN_PROGRESS:
            _verify_exam_password(exam, start_request.password)
            existing_attempt.last_opened_at = current_time
            await db.commit()
            existing_attempt = await _get_attempt_or_404(db, existing_attempt.id)
            return {
                **_serialize_attempt(existing_attempt, current_time),
                "exam_access_token": None,
            }
        if len(existing_attempts) >= max(exam.max_attempts_per_student or 1, 1):
            return {
                **_serialize_attempt(existing_attempt, current_time),
                "exam_access_token": None,
            }

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
    if exam.start_time and current_time < exam.start_time:
        raise HTTPException(status_code=400, detail="Exam has not opened yet")

    availability_close_time = _get_exam_availability_close_time(exam)
    if availability_close_time and current_time >= availability_close_time:
        raise HTTPException(status_code=400, detail="Exam availability window has ended")

    _verify_exam_password(exam, start_request.password)

    question_result = await db.execute(
        select(ExamQuestion).filter(ExamQuestion.exam_id == exam_id).limit(1)
    )
    if question_result.scalars().first() is None:
        raise HTTPException(status_code=400, detail="Exam does not have any questions")

    attempt = Attempt(
        exam_id=exam_id,
        student_id=current_user.id,
        status=AttemptStatus.IN_PROGRESS,
        started_at=current_time,
        ends_at=current_time + timedelta(minutes=max(exam.duration_minutes, 0)),
        last_opened_at=current_time,
    )
    db.add(attempt)
    await db.commit()
    attempt = await _get_attempt_or_404(db, attempt.id)
    return {
        **_serialize_attempt(attempt, current_time),
        "exam_access_token": None,
    }


@router.post("/{attempt_id}/response")
async def save_response(
    attempt_id: int,
    response: ResponseCreate,
    request: Request,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    attempt = await _get_attempt_or_404(db, attempt_id)
    if attempt.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    await _sync_attempt_state(db, attempt, commit=True)
    _ensure_exam_access_token(request, attempt=attempt, current_user=current_user)
    if attempt.status != AttemptStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Attempt time has expired or the exam was already submitted")

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
    request: Request,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    attempt = await _get_attempt_or_404(db, attempt_id)
    if attempt.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    await _sync_attempt_state(db, attempt, commit=True)
    _ensure_exam_access_token(request, attempt=attempt, current_user=current_user)
    if attempt.status != AttemptStatus.IN_PROGRESS:
        if attempt.status == AttemptStatus.SUBMITTED:
            return {"status": "submitted"}
        raise HTTPException(status_code=400, detail="Attempt is already completed")

    attempt.status = AttemptStatus.SUBMITTED
    attempt.submitted_at = _utcnow()
    await db.commit()
    return {"status": "submitted"}


@router.post("/{attempt_id}/log")
async def log_proctoring_event(
    attempt_id: int,
    log: ProctorLogCreate,
    request: Request,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    attempt = await _get_attempt_or_404(db, attempt_id)
    if attempt.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    await _sync_attempt_state(db, attempt, commit=True)
    _ensure_exam_access_token(request, attempt=attempt, current_user=current_user)
    if attempt.status != AttemptStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Attempt is no longer active")

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
