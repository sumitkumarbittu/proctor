from typing import Any, Iterable, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.attempt import Attempt
from app.models.exam import (
    Assignment,
    Exam,
    ExamQuestion,
    ExamStatus,
    Question,
    QuestionFolder,
    QuestionFolderShare,
    TeacherAssignment,
)
from app.models.user import User, UserRole
from app.schemas.exam import (
    Exam as ExamSchema,
    ExamAssign,
    ExamCreate,
    ExamUpdate,
    Question as QuestionSchema,
    QuestionCreate,
    QuestionFolder as QuestionFolderSchema,
    QuestionFolderCreate,
    QuestionFolderUpdate,
    QuestionUpdate,
)

router = APIRouter()

DEFAULT_FOLDER_NAME = "My Questions"


def _exam_query():
    return select(Exam).options(
        selectinload(Exam.creator),
        selectinload(Exam.questions)
        .selectinload(ExamQuestion.question)
        .selectinload(Question.folder)
        .selectinload(QuestionFolder.owner),
        selectinload(Exam.assignments).selectinload(Assignment.student),
        selectinload(Exam.teacher_assignments).selectinload(TeacherAssignment.teacher),
        selectinload(Exam.attempts),
    )


def _folder_query():
    return select(QuestionFolder).options(
        selectinload(QuestionFolder.owner),
        selectinload(QuestionFolder.questions),
        selectinload(QuestionFolder.shares).selectinload(QuestionFolderShare.user),
    )


def _question_query():
    return select(Question).options(
        selectinload(Question.folder).selectinload(QuestionFolder.owner),
        selectinload(Question.folder)
        .selectinload(QuestionFolder.shares)
        .selectinload(QuestionFolderShare.user),
    )


def _serialize_user(user: User | None) -> dict[str, Any] | None:
    if not user:
        return None
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }


def _serialize_folder(folder: QuestionFolder | None, current_user: User) -> dict[str, Any] | None:
    if not folder:
        return None

    is_owner = folder.owner_id == current_user.id or current_user.role == UserRole.ADMIN
    return {
        "id": folder.id,
        "name": folder.name,
        "description": folder.description,
        "owner_id": folder.owner_id,
        "created_at": folder.created_at,
        "updated_at": folder.updated_at,
        "owner": _serialize_user(folder.owner),
        "shared_with": [_serialize_user(link.user) for link in folder.shares if link.user],
        "access_level": "owner" if is_owner else "shared",
        "question_count": len(folder.questions),
    }


def _serialize_question(
    question: Question,
    current_user: User,
    *,
    include_folder: bool,
) -> dict[str, Any]:
    folder_payload = _serialize_folder(question.folder, current_user) if include_folder else None
    return {
        "id": question.id,
        "type": question.type,
        "prompt": question.prompt,
        "options": question.options,
        "marks": question.marks,
        "folder_id": question.folder_id,
        "created_by": question.created_by,
        "created_at": question.created_at,
        "folder": folder_payload,
        "owner": _serialize_user(question.folder.owner if question.folder else None),
    }


def _sort_exam_questions(exam: Exam) -> Exam:
    exam.questions.sort(key=lambda exam_question: exam_question.order_index or 0)
    return exam


def _serialize_exam(exam: Exam, current_user: User) -> dict[str, Any]:
    include_management = current_user.role in [UserRole.ADMIN, UserRole.EXAMINER]
    sorted_exam = _sort_exam_questions(exam)

    return {
        "id": sorted_exam.id,
        "title": sorted_exam.title,
        "instructions": sorted_exam.instructions,
        "duration_minutes": sorted_exam.duration_minutes,
        "start_time": sorted_exam.start_time,
        "status": sorted_exam.status,
        "created_by": sorted_exam.created_by,
        "created_at": sorted_exam.created_at,
        "creator": _serialize_user(sorted_exam.creator) if include_management else None,
        "questions": [
            {
                "question_id": exam_question.question_id,
                "order_index": exam_question.order_index or 0,
                "question": _serialize_question(
                    exam_question.question,
                    current_user,
                    include_folder=include_management,
                ),
            }
            for exam_question in sorted_exam.questions
            if exam_question.question
        ],
        "assignments": [
            {
                "exam_id": assignment.exam_id,
                "student_id": assignment.student_id,
                "student": _serialize_user(assignment.student),
            }
            for assignment in sorted_exam.assignments
        ]
        if include_management
        else [],
        "teacher_assignments": [
            {
                "exam_id": assignment.exam_id,
                "teacher_id": assignment.teacher_id,
                "assigned_at": assignment.assigned_at,
                "teacher": _serialize_user(assignment.teacher),
            }
            for assignment in sorted_exam.teacher_assignments
        ]
        if include_management
        else [],
    }


def _has_exam_staff_access(exam: Exam, current_user: User) -> bool:
    if current_user.role == UserRole.ADMIN:
        return True
    if current_user.role != UserRole.EXAMINER:
        return False
    if exam.created_by == current_user.id:
        return True
    return any(
        assignment.teacher_id == current_user.id for assignment in exam.teacher_assignments
    )


def _ensure_exam_staff_access(exam: Exam, current_user: User) -> None:
    if not _has_exam_staff_access(exam, current_user):
        raise HTTPException(status_code=403, detail="Exam is not available to this teacher")


def _folder_is_accessible(folder: QuestionFolder, current_user: User) -> bool:
    if current_user.role == UserRole.ADMIN:
        return True
    if folder.owner_id == current_user.id:
        return True
    return any(link.user_id == current_user.id for link in folder.shares)


def _ensure_folder_owner_access(folder: QuestionFolder, current_user: User) -> None:
    if current_user.role == UserRole.ADMIN:
        return
    if folder.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Folder is not editable by this user")


def _question_is_accessible(question: Question, current_user: User) -> bool:
    if current_user.role == UserRole.ADMIN:
        return True
    if question.created_by == current_user.id:
        return True
    if question.folder and _folder_is_accessible(question.folder, current_user):
        return True
    return False


def _ensure_question_owner_access(question: Question, current_user: User) -> None:
    if current_user.role == UserRole.ADMIN:
        return
    if question.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Question is not editable by this user")


async def _get_exam_or_404(db: AsyncSession, exam_id: int) -> Exam:
    result = await db.execute(_exam_query().filter(Exam.id == exam_id))
    exam = result.scalars().unique().first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam


async def _get_folder_or_404(db: AsyncSession, folder_id: int) -> QuestionFolder:
    result = await db.execute(_folder_query().filter(QuestionFolder.id == folder_id))
    folder = result.scalars().unique().first()
    if not folder:
        raise HTTPException(status_code=404, detail="Question folder not found")
    return folder


async def _get_question_or_404(db: AsyncSession, question_id: int) -> Question:
    result = await db.execute(_question_query().filter(Question.id == question_id))
    question = result.scalars().unique().first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


async def _get_or_create_default_folder(db: AsyncSession, current_user: User) -> QuestionFolder:
    result = await db.execute(
        _folder_query().filter(
            QuestionFolder.owner_id == current_user.id,
            QuestionFolder.name == DEFAULT_FOLDER_NAME,
        )
    )
    folder = result.scalars().unique().first()
    if folder:
        return folder

    folder = QuestionFolder(
        name=DEFAULT_FOLDER_NAME,
        description="Default personal question folder",
        owner_id=current_user.id,
    )
    db.add(folder)
    await db.flush()
    await db.refresh(folder)
    return folder


async def _validate_users_for_role(
    db: AsyncSession,
    ids: Iterable[int],
    role: UserRole,
) -> list[User]:
    unique_ids = sorted({user_id for user_id in ids if user_id})
    if not unique_ids:
        return []

    result = await db.execute(select(User).filter(User.id.in_(unique_ids)))
    users = result.scalars().all()
    found_ids = {user.id for user in users}

    if found_ids != set(unique_ids):
        raise HTTPException(status_code=400, detail=f"Some {role.value}s were not found")

    invalid = [user.email for user in users if user.role != role]
    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Selected users must all be {role.value}s",
        )
    return users


async def _sync_folder_shares(
    db: AsyncSession,
    folder: QuestionFolder,
    teacher_ids: list[int],
) -> None:
    existing_ids = {link.user_id for link in folder.shares}
    desired_ids = {
        teacher_id
        for teacher_id in teacher_ids
        if teacher_id != folder.owner_id
    }

    for link in list(folder.shares):
        if link.user_id not in desired_ids:
            await db.delete(link)

    for teacher_id in desired_ids - existing_ids:
        db.add(QuestionFolderShare(folder_id=folder.id, user_id=teacher_id))


async def _share_exam_folders_with_teachers(
    db: AsyncSession,
    exam: Exam,
    teacher_ids: list[int],
) -> None:
    folder_ids = {
        exam_question.question.folder_id
        for exam_question in exam.questions
        if exam_question.question and exam_question.question.folder_id
    }
    if not folder_ids or not teacher_ids:
        return

    result = await db.execute(
        _folder_query().filter(QuestionFolder.id.in_(folder_ids))
    )
    folders = result.scalars().unique().all()
    for folder in folders:
        existing_ids = {link.user_id for link in folder.shares}
        for teacher_id in teacher_ids:
            if teacher_id == folder.owner_id or teacher_id in existing_ids:
                continue
            db.add(QuestionFolderShare(folder_id=folder.id, user_id=teacher_id))


@router.post("/question-folders", response_model=QuestionFolderSchema)
async def create_question_folder(
    *,
    db: AsyncSession = Depends(deps.get_db),
    folder_in: QuestionFolderCreate,
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    teacher_ids = [teacher_id for teacher_id in folder_in.share_with_teacher_ids if teacher_id]
    await _validate_users_for_role(db, teacher_ids, UserRole.EXAMINER)

    folder = QuestionFolder(
        name=folder_in.name.strip(),
        description=(folder_in.description or "").strip() or None,
        owner_id=current_user.id,
    )
    db.add(folder)
    await db.flush()
    await db.refresh(folder)

    if teacher_ids:
        refreshed_folder = await _get_folder_or_404(db, folder.id)
        await _sync_folder_shares(db, refreshed_folder, teacher_ids)

    await db.commit()
    folder = await _get_folder_or_404(db, folder.id)
    return _serialize_folder(folder, current_user)


@router.get("/question-folders", response_model=List[QuestionFolderSchema])
async def read_question_folders(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    stmt = _folder_query()

    if current_user.role != UserRole.ADMIN:
        shared_exists = (
            select(QuestionFolderShare.folder_id)
            .filter(
                QuestionFolderShare.folder_id == QuestionFolder.id,
                QuestionFolderShare.user_id == current_user.id,
            )
            .exists()
        )
        stmt = stmt.filter(
            or_(
                QuestionFolder.owner_id == current_user.id,
                shared_exists,
            )
        )

    result = await db.execute(stmt.order_by(QuestionFolder.name.asc()))
    folders = result.scalars().unique().all()
    return [_serialize_folder(folder, current_user) for folder in folders]


@router.put("/question-folders/{folder_id}", response_model=QuestionFolderSchema)
async def update_question_folder(
    folder_id: int,
    folder_in: QuestionFolderUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    folder = await _get_folder_or_404(db, folder_id)
    _ensure_folder_owner_access(folder, current_user)

    if folder_in.name is not None:
        folder.name = folder_in.name.strip()
    if folder_in.description is not None:
        folder.description = folder_in.description.strip() or None

    if folder_in.share_with_teacher_ids is not None:
        teacher_ids = [teacher_id for teacher_id in folder_in.share_with_teacher_ids if teacher_id]
        await _validate_users_for_role(db, teacher_ids, UserRole.EXAMINER)
        await _sync_folder_shares(db, folder, teacher_ids)

    await db.commit()
    folder = await _get_folder_or_404(db, folder_id)
    return _serialize_folder(folder, current_user)


@router.post("/questions", response_model=QuestionSchema)
async def create_question(
    *,
    db: AsyncSession = Depends(deps.get_db),
    question_in: QuestionCreate,
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    folder: QuestionFolder | None = None
    if question_in.folder_id:
        folder = await _get_folder_or_404(db, question_in.folder_id)
        _ensure_folder_owner_access(folder, current_user)
    else:
        folder = await _get_or_create_default_folder(db, current_user)

    question = Question(
        type=question_in.type,
        prompt=question_in.prompt,
        options=question_in.options,
        correct_option=question_in.correct_option,
        marks=question_in.marks,
        created_by=current_user.id,
        folder_id=folder.id if folder else None,
    )
    db.add(question)
    await db.commit()
    question = await _get_question_or_404(db, question.id)
    return _serialize_question(question, current_user, include_folder=True)


@router.get("/questions", response_model=List[QuestionSchema])
async def read_questions(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
    folder_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    stmt = _question_query()

    if current_user.role != UserRole.ADMIN:
        shared_exists = (
            select(QuestionFolderShare.folder_id)
            .filter(
                QuestionFolderShare.folder_id == Question.folder_id,
                QuestionFolderShare.user_id == current_user.id,
            )
            .exists()
        )
        stmt = stmt.filter(
            or_(
                Question.created_by == current_user.id,
                shared_exists,
            )
        )

    if folder_id is not None:
        stmt = stmt.filter(Question.folder_id == folder_id)

    result = await db.execute(
        stmt.order_by(Question.created_at.desc()).offset(skip).limit(limit)
    )
    questions = result.scalars().unique().all()
    return [
        _serialize_question(question, current_user, include_folder=True)
        for question in questions
    ]


@router.put("/questions/{question_id}", response_model=QuestionSchema)
async def update_question(
    question_id: int,
    question_in: QuestionUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    question = await _get_question_or_404(db, question_id)
    _ensure_question_owner_access(question, current_user)

    if question_in.folder_id is not None:
        if question_in.folder_id:
            folder = await _get_folder_or_404(db, question_in.folder_id)
            _ensure_folder_owner_access(folder, current_user)
            question.folder_id = folder.id
        else:
            folder = await _get_or_create_default_folder(db, current_user)
            question.folder_id = folder.id

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
    question = await _get_question_or_404(db, question_id)
    return _serialize_question(question, current_user, include_folder=True)


@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    question = await _get_question_or_404(db, question_id)
    _ensure_question_owner_access(question, current_user)

    await db.execute(delete(ExamQuestion).where(ExamQuestion.question_id == question_id))
    await db.delete(question)
    await db.commit()
    return {"status": "deleted", "id": question_id}


@router.post("/", response_model=ExamSchema)
async def create_exam(
    *,
    db: AsyncSession = Depends(deps.get_db),
    exam_in: ExamCreate,
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    exam = Exam(
        title=exam_in.title,
        instructions=exam_in.instructions,
        start_time=exam_in.start_time,
        duration_minutes=exam_in.duration_minutes,
        status=exam_in.status,
        created_by=current_user.id,
    )
    db.add(exam)
    await db.commit()
    exam = await _get_exam_or_404(db, exam.id)
    return _serialize_exam(exam, current_user)


@router.get("/", response_model=List[ExamSchema])
async def read_exams(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    stmt = _exam_query()

    if current_user.role == UserRole.ADMIN:
        stmt = stmt.order_by(Exam.created_at.desc())
    elif current_user.role == UserRole.EXAMINER:
        assigned_teacher_exists = (
            select(TeacherAssignment.exam_id)
            .filter(
                TeacherAssignment.exam_id == Exam.id,
                TeacherAssignment.teacher_id == current_user.id,
            )
            .exists()
        )
        stmt = (
            stmt.filter(or_(Exam.created_by == current_user.id, assigned_teacher_exists))
            .order_by(Exam.created_at.desc())
        )
    else:
        assignment_exists = (
            select(Assignment.exam_id)
            .filter(
                Assignment.exam_id == Exam.id,
                Assignment.student_id == current_user.id,
            )
            .exists()
        )
        attempt_exists = (
            select(Attempt.id)
            .filter(
                Attempt.exam_id == Exam.id,
                Attempt.student_id == current_user.id,
            )
            .exists()
        )
        stmt = (
            stmt.filter(
                or_(assignment_exists, attempt_exists),
                Exam.status != ExamStatus.DRAFT,
            )
            .order_by(Exam.start_time.is_(None), Exam.start_time.asc(), Exam.created_at.desc())
        )

    result = await db.execute(stmt.offset(skip).limit(limit))
    exams = result.scalars().unique().all()
    return [_serialize_exam(exam, current_user) for exam in exams]


@router.get("/{exam_id}", response_model=ExamSchema)
async def read_exam(
    exam_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    exam = await _get_exam_or_404(db, exam_id)

    if current_user.role == UserRole.EXAMINER:
        _ensure_exam_staff_access(exam, current_user)
    elif current_user.role == UserRole.STUDENT:
        is_assigned = any(
            assignment.student_id == current_user.id for assignment in exam.assignments
        )
        has_attempt = any(
            attempt.student_id == current_user.id for attempt in exam.attempts
        )
        if not is_assigned and not has_attempt:
            raise HTTPException(status_code=403, detail="Exam is not available to this student")
        if exam.status == ExamStatus.DRAFT and not has_attempt:
            raise HTTPException(status_code=403, detail="Exam is not available yet")

    return _serialize_exam(exam, current_user)


@router.put("/{exam_id}", response_model=ExamSchema)
async def update_exam(
    exam_id: int,
    exam_in: ExamUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    exam = await _get_exam_or_404(db, exam_id)
    _ensure_exam_staff_access(exam, current_user)

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
    exam = await _get_exam_or_404(db, exam_id)
    return _serialize_exam(exam, current_user)


@router.delete("/{exam_id}")
async def delete_exam(
    exam_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    exam = await _get_exam_or_404(db, exam_id)
    _ensure_exam_staff_access(exam, current_user)

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
    exam = await _get_exam_or_404(db, exam_id)
    _ensure_exam_staff_access(exam, current_user)

    question = await _get_question_or_404(db, question_id)
    if not _question_is_accessible(question, current_user):
        raise HTTPException(status_code=403, detail="Question is not available to this teacher")

    existing_result = await db.execute(
        select(ExamQuestion).filter(
            ExamQuestion.exam_id == exam_id,
            ExamQuestion.question_id == question_id,
        )
    )
    if existing_result.scalars().first():
        raise HTTPException(status_code=400, detail="Question already in exam")

    next_order = len(exam.questions)
    db.add(ExamQuestion(exam_id=exam_id, question_id=question_id, order_index=next_order))
    await db.flush()

    teacher_ids = [assignment.teacher_id for assignment in exam.teacher_assignments]
    if question.folder_id and teacher_ids:
        folder = await _get_folder_or_404(db, question.folder_id)
        merged_ids = teacher_ids + [link.user_id for link in folder.shares]
        await _sync_folder_shares(db, folder, merged_ids)

    await db.commit()
    return {"status": "added"}


@router.delete("/{exam_id}/questions/{question_id}")
async def remove_question_from_exam(
    exam_id: int,
    question_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    exam = await _get_exam_or_404(db, exam_id)
    _ensure_exam_staff_access(exam, current_user)

    result = await db.execute(
        select(ExamQuestion).filter(
            ExamQuestion.exam_id == exam_id,
            ExamQuestion.question_id == question_id,
        )
    )
    exam_question = result.scalars().first()
    if not exam_question:
        raise HTTPException(status_code=404, detail="Question not in exam")

    await db.delete(exam_question)
    await db.commit()
    return {"status": "removed"}


@router.post("/{exam_id}/assign")
async def assign_exam_users(
    exam_id: int,
    data: ExamAssign,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    exam = await _get_exam_or_404(db, exam_id)
    _ensure_exam_staff_access(exam, current_user)

    teacher_ids = sorted({teacher_id for teacher_id in data.teacher_ids if teacher_id})
    student_ids = sorted({student_id for student_id in data.student_ids if student_id})

    await _validate_users_for_role(db, teacher_ids, UserRole.EXAMINER)
    await _validate_users_for_role(db, student_ids, UserRole.STUDENT)

    existing_teacher_ids = {assignment.teacher_id for assignment in exam.teacher_assignments}
    existing_student_ids = {assignment.student_id for assignment in exam.assignments}

    for assignment in list(exam.teacher_assignments):
        if assignment.teacher_id not in teacher_ids:
            await db.delete(assignment)
    for assignment in list(exam.assignments):
        if assignment.student_id not in student_ids:
            await db.delete(assignment)

    for teacher_id in set(teacher_ids) - existing_teacher_ids:
        db.add(TeacherAssignment(exam_id=exam.id, teacher_id=teacher_id))
    for student_id in set(student_ids) - existing_student_ids:
        db.add(Assignment(exam_id=exam.id, student_id=student_id))

    await db.flush()

    refreshed_exam = await _get_exam_or_404(db, exam_id)
    await _share_exam_folders_with_teachers(db, refreshed_exam, teacher_ids)
    await db.commit()

    refreshed_exam = await _get_exam_or_404(db, exam_id)
    return {
        "status": "assigned",
        "teacher_ids": teacher_ids,
        "student_ids": student_ids,
        "exam": _serialize_exam(refreshed_exam, current_user),
    }


@router.put("/{exam_id}/status")
async def update_exam_status(
    exam_id: int,
    status_update: dict,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    exam = await _get_exam_or_404(db, exam_id)
    _ensure_exam_staff_access(exam, current_user)

    new_status = status_update.get("status")
    if new_status:
        try:
            exam.status = ExamStatus(new_status)
        except ValueError as error:
            raise HTTPException(status_code=400, detail=f"Invalid status: {new_status}") from error

    await db.commit()
    return {"status": exam.status}
