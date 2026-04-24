from datetime import datetime
from typing import Any, Iterable

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.core import security
from app.models.attempt import Attempt, AttemptStatus, ProctoringLog, Response, Result
from app.models.exam import (
    Assignment,
    Exam,
    ExamQuestion,
    ExamStatus,
    Question,
    QuestionFolder,
    QuestionFolderShare,
    QuestionType,
    TeacherAssignment,
)
from app.models.trash import TrashedItem, TrashEntityType
from app.models.user import User, UserRole
from app.schemas.trash import TrashActionResponse, TrashItem as TrashItemSchema

router = APIRouter()


def _parse_datetime(value: Any) -> datetime | None:
    if value is None or isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    return None


def _enum_or_default(enum_cls: Any, value: Any, default: Any) -> Any:
    if value is None:
        return default
    if isinstance(value, enum_cls):
        return value
    try:
        return enum_cls(value)
    except ValueError:
        return default


def _coerce_int_list(values: Iterable[Any] | None) -> list[int]:
    coerced: list[int] = []
    for value in values or []:
        try:
            coerced.append(int(value))
        except (TypeError, ValueError):
            continue
    return coerced


def _can_manage_trash_item(item: TrashedItem, current_user: User) -> bool:
    if current_user.role == UserRole.ADMIN:
        return True
    if current_user.role != UserRole.EXAMINER:
        return False

    snapshot = item.snapshot or {}
    if item.entity_type == TrashEntityType.USER:
        return False
    if item.entity_type == TrashEntityType.EXAM:
        teacher_ids = _coerce_int_list(snapshot.get("teacher_ids"))
        return snapshot.get("created_by") == current_user.id or current_user.id in teacher_ids
    if item.entity_type == TrashEntityType.QUESTION:
        folder_access = snapshot.get("folder_access") or {}
        shared_user_ids = _coerce_int_list(folder_access.get("shared_user_ids"))
        return (
            snapshot.get("created_by") == current_user.id
            or folder_access.get("owner_id") == current_user.id
            or current_user.id in shared_user_ids
        )
    if item.entity_type == TrashEntityType.FOLDER:
        return snapshot.get("owner_id") == current_user.id
    if item.entity_type == TrashEntityType.ATTEMPT:
        exam_access = snapshot.get("exam_access") or {}
        teacher_ids = _coerce_int_list(exam_access.get("teacher_ids"))
        return exam_access.get("created_by") == current_user.id or current_user.id in teacher_ids
    return False


def _ensure_trash_access(item: TrashedItem, current_user: User, *, action: str) -> None:
    if not _can_manage_trash_item(item, current_user):
        raise HTTPException(status_code=403, detail=f"You cannot {action} this trash entry")


def _serialize_trash(item: TrashedItem, current_user: User) -> dict[str, Any]:
    allowed = _can_manage_trash_item(item, current_user)
    return {
        "id": item.id,
        "entity_type": item.entity_type,
        "original_id": item.original_id,
        "label": item.label,
        "snapshot": item.snapshot,
        "deleted_by": item.deleted_by,
        "deleted_at": item.deleted_at,
        "can_restore": allowed,
        "can_permanent_delete": allowed,
    }


async def _get_trash_item_or_404(db: AsyncSession, trash_id: int) -> TrashedItem:
    result = await db.execute(select(TrashedItem).filter(TrashedItem.id == trash_id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Trash entry not found")
    return item


async def _ensure_primary_slot_free(
    db: AsyncSession,
    model: Any,
    original_id: int,
    label: str,
) -> None:
    existing = await db.get(model, original_id)
    if existing is not None:
        raise HTTPException(status_code=400, detail=f"The {label} already exists and cannot be restored")


async def _restore_question_from_snapshot(
    db: AsyncSession,
    snapshot: dict[str, Any],
    current_user: User,
    *,
    original_id: int | None = None,
    folder_id_override: int | None = None,
    strict: bool,
) -> Question | None:
    question_id = original_id if original_id is not None else int(snapshot.get("id"))
    if await db.get(Question, question_id):
        if strict:
            raise HTTPException(status_code=400, detail="The question already exists and cannot be restored")
        return None

    folder_id = folder_id_override if folder_id_override is not None else snapshot.get("folder_id")
    if folder_id is not None and await db.get(QuestionFolder, int(folder_id)) is None:
        folder_id = None

    created_by = snapshot.get("created_by")
    if created_by is not None and await db.get(User, int(created_by)) is None:
        created_by = current_user.id

    question = Question(
        id=question_id,
        type=_enum_or_default(QuestionType, snapshot.get("type"), QuestionType.MCQ),
        prompt=snapshot.get("prompt") or "Restored question",
        options=snapshot.get("options"),
        correct_option=snapshot.get("correct_option"),
        marks=int(snapshot.get("marks") or 1),
        folder_id=int(folder_id) if folder_id is not None else None,
        created_by=int(created_by) if created_by is not None else current_user.id,
        created_at=_parse_datetime(snapshot.get("created_at")) or datetime.utcnow(),
    )
    db.add(question)
    await db.flush()

    for link in snapshot.get("exam_links") or []:
        exam_id = link.get("exam_id")
        if exam_id is None or await db.get(Exam, int(exam_id)) is None:
            continue
        existing_link = await db.get(ExamQuestion, (int(exam_id), question.id))
        if existing_link is not None:
            continue
        db.add(
            ExamQuestion(
                exam_id=int(exam_id),
                question_id=question.id,
                order_index=int(link.get("order_index") or 0),
            )
        )

    return question


async def _restore_user(
    item: TrashedItem,
    db: AsyncSession,
    current_user: User,
) -> tuple[int, str | None]:
    snapshot = item.snapshot or {}
    await _ensure_primary_slot_free(db, User, item.original_id, "user")

    email = snapshot.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="The user snapshot is incomplete")

    existing = await db.execute(select(User).filter(User.email == email))
    if existing.scalars().first() is not None:
        raise HTTPException(status_code=400, detail="A user with this email already exists")

    password_hash = snapshot.get("password_hash")
    message: str | None = None
    is_active = bool(snapshot.get("is_active", True))
    if not password_hash:
        password_hash = security.get_password_hash("RESET_REQUIRED")
        is_active = False
        message = "User restored as inactive because a password reset is required."

    user = User(
        id=item.original_id,
        name=snapshot.get("name"),
        email=email,
        role=_enum_or_default(UserRole, snapshot.get("role"), UserRole.STUDENT),
        is_active=is_active,
        password_hash=password_hash,
        created_at=_parse_datetime(snapshot.get("created_at")) or datetime.utcnow(),
    )
    db.add(user)
    return user.id, message


async def _restore_exam(
    item: TrashedItem,
    db: AsyncSession,
    current_user: User,
) -> tuple[int, str | None]:
    snapshot = item.snapshot or {}
    await _ensure_primary_slot_free(db, Exam, item.original_id, "exam")

    created_by = snapshot.get("created_by")
    if created_by is not None and await db.get(User, int(created_by)) is None:
        created_by = current_user.id
    schedule_updated_by = snapshot.get("schedule_updated_by")
    if schedule_updated_by is not None and await db.get(User, int(schedule_updated_by)) is None:
        schedule_updated_by = None

    exam = Exam(
        id=item.original_id,
        title=snapshot.get("title") or "Restored exam",
        instructions=snapshot.get("instructions"),
        status=_enum_or_default(ExamStatus, snapshot.get("status"), ExamStatus.DRAFT),
        start_time=_parse_datetime(snapshot.get("start_time")),
        duration_minutes=int(snapshot.get("duration_minutes") or 60),
        password_hash=snapshot.get("password_hash"),
        created_by=int(created_by) if created_by is not None else current_user.id,
        schedule_updated_by=int(schedule_updated_by) if schedule_updated_by is not None else None,
        schedule_updated_at=_parse_datetime(snapshot.get("schedule_updated_at")),
        created_at=_parse_datetime(snapshot.get("created_at")) or datetime.utcnow(),
    )
    db.add(exam)
    await db.flush()

    teacher_ids = _coerce_int_list(snapshot.get("teacher_ids"))
    student_ids = _coerce_int_list(snapshot.get("student_ids"))
    if teacher_ids:
        teacher_result = await db.execute(select(User).filter(User.id.in_(teacher_ids)))
        for teacher in teacher_result.scalars().all():
            if teacher.role == UserRole.EXAMINER:
                db.add(TeacherAssignment(exam_id=exam.id, teacher_id=teacher.id))
    if student_ids:
        student_result = await db.execute(select(User).filter(User.id.in_(student_ids)))
        for student in student_result.scalars().all():
            if student.role == UserRole.STUDENT:
                db.add(Assignment(exam_id=exam.id, student_id=student.id))

    for link in snapshot.get("question_links") or []:
        question_id = link.get("question_id")
        if question_id is None or await db.get(Question, int(question_id)) is None:
            continue
        db.add(
            ExamQuestion(
                exam_id=exam.id,
                question_id=int(question_id),
                order_index=int(link.get("order_index") or 0),
            )
        )

    return exam.id, None


async def _restore_question(
    item: TrashedItem,
    db: AsyncSession,
    current_user: User,
) -> tuple[int, str | None]:
    question = await _restore_question_from_snapshot(
        db,
        item.snapshot or {},
        current_user,
        original_id=item.original_id,
        strict=True,
    )
    if question is None:
        raise HTTPException(status_code=400, detail="The question could not be restored")
    return question.id, None


async def _restore_folder(
    item: TrashedItem,
    db: AsyncSession,
    current_user: User,
) -> tuple[int, str | None]:
    snapshot = item.snapshot or {}
    await _ensure_primary_slot_free(db, QuestionFolder, item.original_id, "folder")

    owner_id = snapshot.get("owner_id")
    if owner_id is not None and await db.get(User, int(owner_id)) is None:
        owner_id = current_user.id

    folder = QuestionFolder(
        id=item.original_id,
        name=snapshot.get("name") or "Restored folder",
        description=snapshot.get("description"),
        owner_id=int(owner_id) if owner_id is not None else current_user.id,
        created_at=_parse_datetime(snapshot.get("created_at")) or datetime.utcnow(),
        updated_at=_parse_datetime(snapshot.get("updated_at")) or datetime.utcnow(),
    )
    db.add(folder)
    await db.flush()

    shared_user_ids = _coerce_int_list(snapshot.get("shared_user_ids"))
    if shared_user_ids:
        shared_result = await db.execute(select(User).filter(User.id.in_(shared_user_ids)))
        for user in shared_result.scalars().all():
            if user.role == UserRole.EXAMINER and user.id != folder.owner_id:
                db.add(QuestionFolderShare(folder_id=folder.id, user_id=user.id))

    skipped_questions = 0
    for question_snapshot in snapshot.get("questions") or []:
        restored_question = await _restore_question_from_snapshot(
            db,
            question_snapshot,
            current_user,
            folder_id_override=folder.id,
            strict=False,
        )
        if restored_question is None:
            skipped_questions += 1

    message = None
    if skipped_questions:
        message = f"Folder restored. {skipped_questions} question(s) were skipped because they already exist."
    return folder.id, message


async def _restore_attempt(
    item: TrashedItem,
    db: AsyncSession,
    current_user: User,
) -> tuple[int, str | None]:
    snapshot = item.snapshot or {}
    await _ensure_primary_slot_free(db, Attempt, item.original_id, "submission")

    exam_id = snapshot.get("exam_id")
    student_id = snapshot.get("student_id")
    if exam_id is None or await db.get(Exam, int(exam_id)) is None:
        raise HTTPException(status_code=400, detail="Restore the related exam before restoring this submission")
    if student_id is None or await db.get(User, int(student_id)) is None:
        raise HTTPException(status_code=400, detail="Restore the related student before restoring this submission")

    attempt = Attempt(
        id=item.original_id,
        exam_id=int(exam_id),
        student_id=int(student_id),
        status=_enum_or_default(AttemptStatus, snapshot.get("status"), AttemptStatus.IN_PROGRESS),
        started_at=_parse_datetime(snapshot.get("started_at")) or datetime.utcnow(),
        ends_at=_parse_datetime(snapshot.get("ends_at")),
        last_opened_at=_parse_datetime(snapshot.get("last_opened_at")),
        submitted_at=_parse_datetime(snapshot.get("submitted_at")),
    )
    db.add(attempt)
    await db.flush()

    for response_snapshot in snapshot.get("responses") or []:
        question_id = response_snapshot.get("question_id")
        if question_id is None or await db.get(Question, int(question_id)) is None:
            continue
        db.add(
            Response(
                attempt_id=attempt.id,
                question_id=int(question_id),
                answer=response_snapshot.get("answer"),
                marks_awarded=response_snapshot.get("marks_awarded") or 0.0,
            )
        )

    for log_snapshot in snapshot.get("logs") or []:
        db.add(
            ProctoringLog(
                attempt_id=attempt.id,
                event_type=log_snapshot.get("event_type") or "RESTORED",
                severity=log_snapshot.get("severity") or "WARNING",
                metadata_info=log_snapshot.get("metadata_info"),
                created_at=_parse_datetime(log_snapshot.get("created_at")) or datetime.utcnow(),
            )
        )

    result_snapshot = snapshot.get("result")
    if result_snapshot:
        db.add(
            Result(
                attempt_id=attempt.id,
                total_score=result_snapshot.get("total_score") or 0.0,
                max_score=result_snapshot.get("max_score") or 0.0,
                published_at=_parse_datetime(result_snapshot.get("published_at")) or datetime.utcnow(),
            )
        )

    return attempt.id, None


@router.get("/", response_model=list[TrashItemSchema])
async def list_trash(
    entity_type: TrashEntityType | None = None,
    q: str | None = None,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    stmt = select(TrashedItem).order_by(TrashedItem.deleted_at.desc())

    if entity_type is not None:
        stmt = stmt.filter(TrashedItem.entity_type == entity_type)
    if q:
        like_value = f"%{q.strip()}%"
        stmt = stmt.filter(TrashedItem.label.ilike(like_value))

    result = await db.execute(stmt)
    items = result.scalars().all()
    visible_items = [item for item in items if _can_manage_trash_item(item, current_user)]
    return [_serialize_trash(item, current_user) for item in visible_items]


async def _permanently_delete_trash_entry(
    trash_id: int,
    db: AsyncSession,
    current_user: User,
) -> dict[str, Any]:
    item = await _get_trash_item_or_404(db, trash_id)
    _ensure_trash_access(item, current_user, action="permanently delete")
    await db.delete(item)
    await db.commit()
    return {"status": "permanently_deleted", "id": trash_id, "entity_type": item.entity_type}


@router.delete("/{trash_id}/permanent", response_model=TrashActionResponse)
async def permanent_delete(
    trash_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    return await _permanently_delete_trash_entry(trash_id, db, current_user)


@router.post("/{trash_id}/restore", response_model=TrashActionResponse)
async def restore_trash_entry(
    trash_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    item = await _get_trash_item_or_404(db, trash_id)
    _ensure_trash_access(item, current_user, action="restore")
    try:
        if item.entity_type == TrashEntityType.USER:
            restored_id, message = await _restore_user(item, db, current_user)
        elif item.entity_type == TrashEntityType.EXAM:
            restored_id, message = await _restore_exam(item, db, current_user)
        elif item.entity_type == TrashEntityType.QUESTION:
            restored_id, message = await _restore_question(item, db, current_user)
        elif item.entity_type == TrashEntityType.FOLDER:
            restored_id, message = await _restore_folder(item, db, current_user)
        elif item.entity_type == TrashEntityType.ATTEMPT:
            restored_id, message = await _restore_attempt(item, db, current_user)
        else:
            raise HTTPException(status_code=400, detail="Restore is not implemented for this entity type")

        await db.delete(item)
        await db.commit()
        return {
            "status": "restored",
            "id": restored_id,
            "entity_type": item.entity_type,
            "message": message,
        }
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to restore item: {exc}") from exc


@router.delete("/{trash_id}", response_model=TrashActionResponse)
async def delete_trash_entry(
    trash_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    return await _permanently_delete_trash_entry(trash_id, db, current_user)
