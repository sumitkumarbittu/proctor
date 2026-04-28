import asyncio
from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException
from starlette.requests import Request

from app.api.v1 import attempts as attempts_api
from app.api.v1.attempts import (
    _ensure_attempt_timing,
    _serialize_attempt,
    log_proctoring_event,
    start_attempt,
)
from app.api.v1.reports import _activity_timeline
from app.api.v1.exams import (
    _exam_query,
    _has_exam_schedule_access,
    _normalize_schedule_datetime,
    _ensure_question_owner_access,
    _question_query,
    _serialize_exam,
    _question_is_accessible,
    _serialize_folder,
)
from app.api.v1.trash import _can_manage_trash_item
from app.api.v1.users import _build_user_permissions, _ensure_user_update_allowed
from app.core.security import get_password_hash
from app.models.attempt import Attempt, AttemptStatus, ProctoringLog
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
from app.models.trash import TrashEntityType, TrashedItem
from app.models.user import User, UserRole
from app.schemas.attempt import AttemptStartRequest, ProctorLogCreate
from app.schemas.user import UserUpdate


def make_user(
    user_id: int,
    role: UserRole,
    *,
    email: str | None = None,
    name: str | None = None,
    is_active: bool = True,
) -> User:
    return User(
        id=user_id,
        email=email or f"user{user_id}@example.com",
        password_hash="hashed",
        name=name or f"User {user_id}",
        role=role,
        is_active=is_active,
    )


def make_folder(owner: User, *, shared_with: list[User] | None = None) -> QuestionFolder:
    folder = QuestionFolder(
        id=101,
        name="Shared Bank",
        description="Reusable questions",
        owner_id=owner.id,
    )
    folder.owner = owner
    folder.questions = []
    folder.shares = []

    for index, user in enumerate(shared_with or [], start=1):
        share = QuestionFolderShare(folder_id=folder.id, user_id=user.id)
        share.user = user
        share.folder = folder
        share.shared_at = None
        folder.shares.append(share)

    return folder


def make_question(folder: QuestionFolder, *, created_by: int) -> Question:
    question = Question(
        id=501,
        type=QuestionType.MCQ,
        prompt="What is 2 + 2?",
        options=["3", "4"],
        correct_option="4",
        marks=1,
        created_by=created_by,
        folder_id=folder.id,
    )
    question.folder = folder
    question.exams = []
    return question


def make_exam(
    creator: User,
    *,
    teacher_ids: list[int] | None = None,
    password_hash: str | None = None,
    duration_minutes: int = 60,
) -> Exam:
    exam = Exam(
        id=301,
        title="Midterm",
        instructions="Stay focused",
        status=ExamStatus.LIVE,
        duration_minutes=duration_minutes,
        created_by=creator.id,
        password_hash=password_hash,
        created_at=datetime(2026, 4, 24, 10, 0, 0),
    )
    exam.creator = creator
    exam.questions = []
    exam.assignments = []
    exam.attempts = []
    exam.teacher_assignments = []

    for teacher_id in teacher_ids or []:
        assignment = TeacherAssignment(exam_id=exam.id, teacher_id=teacher_id)
        assignment.exam = exam
        exam.teacher_assignments.append(assignment)

    return exam


def collect_option_paths(statement) -> set[tuple[str, ...]]:
    paths: set[tuple[str, ...]] = set()
    for option in statement._with_options:
        path = tuple(
            token.key
            for token in option.path
            if getattr(token, "key", None)
        )
        if path:
            paths.add(path)
    return paths


class _FakeScalarResult:
    def __init__(self, value) -> None:
        self._value = value

    def unique(self):
        return self

    def first(self):
        return self._value

    def all(self):
        if self._value is None:
            return []
        if isinstance(self._value, list):
            return self._value
        return [self._value]


class _FakeExecuteResult:
    def __init__(self, value) -> None:
        self._value = value

    def scalars(self) -> _FakeScalarResult:
        return _FakeScalarResult(self._value)


class _FakeAsyncSession:
    def __init__(self, results: list[object | None]) -> None:
        self._results = list(results)
        self.added: list[object] = []
        self.commit_calls = 0
        self.next_attempt_id = 901

    async def execute(self, statement) -> _FakeExecuteResult:
        if not self._results:
            raise AssertionError(f"Unexpected execute call for statement: {statement}")
        return _FakeExecuteResult(self._results.pop(0))

    def add(self, item) -> None:
        if isinstance(item, Attempt) and item.id is None:
            item.id = self.next_attempt_id
        self.added.append(item)

    async def commit(self) -> None:
        self.commit_calls += 1

    async def flush(self) -> None:
        return None


def test_examiner_permissions_protect_self_and_admin() -> None:
    examiner = make_user(2, UserRole.EXAMINER)
    self_permissions = _build_user_permissions(examiner, examiner)
    admin_permissions = _build_user_permissions(make_user(1, UserRole.ADMIN), examiner)
    peer_permissions = _build_user_permissions(make_user(3, UserRole.EXAMINER), examiner)

    assert self_permissions["can_edit"] is False
    assert self_permissions["can_toggle_active"] is False
    assert self_permissions["protected_reason"] == "You cannot change your own access."

    assert admin_permissions["can_edit"] is False
    assert admin_permissions["can_remove_access"] is False
    assert admin_permissions["protected_reason"] == "Admin access is protected."

    assert peer_permissions["can_edit"] is True
    assert peer_permissions["can_remove_access"] is True
    assert peer_permissions["can_change_role"] is True
    assert peer_permissions["can_toggle_active"] is True
    assert peer_permissions["can_delete"] is False


def test_admin_permissions_keep_self_protected_but_manage_others() -> None:
    admin = make_user(1, UserRole.ADMIN)
    self_permissions = _build_user_permissions(admin, admin)
    other_permissions = _build_user_permissions(make_user(4, UserRole.EXAMINER), admin)

    assert self_permissions["can_edit"] is False
    assert self_permissions["can_delete"] is False
    assert self_permissions["protected_reason"] == "Your access is protected from this screen."

    assert other_permissions["can_edit"] is True
    assert other_permissions["can_remove_access"] is True
    assert other_permissions["can_change_role"] is True
    assert other_permissions["can_toggle_active"] is True
    assert other_permissions["can_delete"] is True


def test_examiner_update_guard_blocks_self_admin_and_role_escalation() -> None:
    examiner = make_user(2, UserRole.EXAMINER)

    with pytest.raises(HTTPException, match="own access"):
        _ensure_user_update_allowed(examiner, examiner, UserUpdate(is_active=False))

    with pytest.raises(HTTPException, match="admin access"):
        _ensure_user_update_allowed(
            examiner,
            make_user(1, UserRole.ADMIN),
            UserUpdate(name="Blocked"),
        )

    with pytest.raises(HTTPException, match="student or examiner roles"):
        _ensure_user_update_allowed(
            examiner,
            make_user(3, UserRole.EXAMINER),
            UserUpdate(role=UserRole.ADMIN),
        )


def test_folder_serialization_distinguishes_owner_admin_and_shared_access() -> None:
    owner = make_user(2, UserRole.EXAMINER)
    collaborator = make_user(3, UserRole.EXAMINER)
    admin = make_user(1, UserRole.ADMIN)
    folder = make_folder(owner, shared_with=[collaborator])

    owner_payload = _serialize_folder(folder, owner)
    admin_payload = _serialize_folder(folder, admin)
    shared_payload = _serialize_folder(folder, collaborator)

    assert owner_payload["access_level"] == "owner"
    assert owner_payload["can_share"] is True

    assert admin_payload["access_level"] == "admin"
    assert admin_payload["can_share"] is True

    assert shared_payload["access_level"] == "shared"
    assert shared_payload["can_edit"] is False
    assert shared_payload["can_share"] is False


def test_shared_question_access_allows_question_management_without_folder_ownership() -> None:
    owner = make_user(2, UserRole.EXAMINER)
    collaborator = make_user(3, UserRole.EXAMINER)
    folder = make_folder(owner, shared_with=[collaborator])
    question = make_question(folder, created_by=owner.id)

    assert _question_is_accessible(question, collaborator) is True
    _ensure_question_owner_access(question, collaborator)


def test_question_query_eager_loads_folder_relationships_used_by_serializer() -> None:
    paths = collect_option_paths(_question_query())

    assert ("folder", "owner") in paths
    assert ("folder", "questions") in paths
    assert ("folder", "shares", "user") in paths


def test_exam_query_eager_loads_folder_relationships_used_by_exam_detail() -> None:
    paths = collect_option_paths(_exam_query())

    assert ("questions", "question", "folder", "owner") in paths
    assert ("questions", "question", "folder", "questions") in paths
    assert ("questions", "question", "folder", "shares", "user") in paths


def test_trash_permissions_follow_snapshot_context_for_examiner() -> None:
    examiner = make_user(3, UserRole.EXAMINER)

    exam_item = TrashedItem(
        id=1,
        entity_type=TrashEntityType.EXAM,
        original_id=71,
        label="Midterm",
        snapshot={"created_by": 7, "teacher_ids": [3, 4]},
        deleted_by=99,
    )
    question_item = TrashedItem(
        id=2,
        entity_type=TrashEntityType.QUESTION,
        original_id=81,
        label="Question",
        snapshot={
            "created_by": 8,
            "folder_access": {"owner_id": 7, "shared_user_ids": [3]},
        },
        deleted_by=99,
    )
    folder_item = TrashedItem(
        id=3,
        entity_type=TrashEntityType.FOLDER,
        original_id=91,
        label="Folder",
        snapshot={"owner_id": 3},
        deleted_by=99,
    )
    attempt_item = TrashedItem(
        id=4,
        entity_type=TrashEntityType.ATTEMPT,
        original_id=101,
        label="Submission #101",
        snapshot={"exam_access": {"created_by": 7, "teacher_ids": [3]}},
        deleted_by=99,
    )
    user_item = TrashedItem(
        id=5,
        entity_type=TrashEntityType.USER,
        original_id=111,
        label="Student",
        snapshot={"role": "student"},
        deleted_by=99,
    )

    assert _can_manage_trash_item(exam_item, examiner) is True
    assert _can_manage_trash_item(question_item, examiner) is True
    assert _can_manage_trash_item(folder_item, examiner) is True
    assert _can_manage_trash_item(attempt_item, examiner) is True
    assert _can_manage_trash_item(user_item, examiner) is False


def test_exam_schedule_access_requires_assigned_examiner_or_admin() -> None:
    creator = make_user(2, UserRole.EXAMINER)
    assigned_examiner = make_user(3, UserRole.EXAMINER)
    peer_examiner = make_user(4, UserRole.EXAMINER)
    admin = make_user(1, UserRole.ADMIN)
    exam = make_exam(creator, teacher_ids=[assigned_examiner.id], password_hash="hashed")

    assert _has_exam_schedule_access(exam, admin) is True
    assert _has_exam_schedule_access(exam, assigned_examiner) is True
    assert _has_exam_schedule_access(exam, creator) is False
    assert _has_exam_schedule_access(exam, peer_examiner) is False


def test_exam_schedule_access_keeps_legacy_creator_fallback_when_no_teacher_assignment_exists() -> None:
    creator = make_user(2, UserRole.EXAMINER)
    exam = make_exam(creator, teacher_ids=[], password_hash="hashed")

    assert _has_exam_schedule_access(exam, creator) is True


def test_exam_serialization_exposes_password_and_schedule_capabilities() -> None:
    creator = make_user(2, UserRole.EXAMINER)
    assigned_examiner = make_user(3, UserRole.EXAMINER)
    peer_examiner = make_user(4, UserRole.EXAMINER)
    exam = make_exam(creator, teacher_ids=[assigned_examiner.id], password_hash="hashed")

    assigned_payload = _serialize_exam(exam, assigned_examiner)
    peer_payload = _serialize_exam(exam, peer_examiner)

    assert assigned_payload["requires_password"] is True
    assert assigned_payload["can_manage_schedule"] is True
    assert assigned_payload["can_manage_timer"] is True
    assert assigned_payload["can_manage_password"] is True

    assert peer_payload["requires_password"] is True
    assert peer_payload["can_manage_schedule"] is False


def test_exam_serialization_exposes_student_attempt_summary() -> None:
    creator = make_user(2, UserRole.EXAMINER)
    student = make_user(9, UserRole.STUDENT)
    exam = make_exam(creator, password_hash="hashed")
    attempt = Attempt(
        id=401,
        exam_id=exam.id,
        student_id=student.id,
        status=AttemptStatus.SUBMITTED,
        started_at=datetime(2026, 4, 24, 10, 0, 0),
        submitted_at=datetime(2026, 4, 24, 10, 20, 0),
    )
    attempt.exam = exam
    attempt.student = student
    attempt.result = None
    exam.attempts = [attempt]

    payload = _serialize_exam(exam, student)

    assert payload["attempt_count"] == 1
    assert payload["student_attempt_count"] == 1
    assert payload["student_attempt_id"] == attempt.id
    assert payload["student_attempt_status"] == "SUBMITTED"


def test_schedule_datetime_normalizes_timezone_aware_values_to_naive_utc() -> None:
    aware = datetime(2026, 4, 24, 12, 30, 0, tzinfo=timezone(timedelta(hours=5, minutes=30)))

    normalized = _normalize_schedule_datetime(aware)

    assert normalized == datetime(2026, 4, 24, 7, 0, 0)
    assert normalized.tzinfo is None


def test_activity_timeline_groups_near_midnight_utc_by_ist_day() -> None:
    creator = make_user(2, UserRole.EXAMINER)
    student = make_user(9, UserRole.STUDENT)
    exam = make_exam(creator)
    attempt = Attempt(
        id=401,
        exam_id=exam.id,
        student_id=student.id,
        status=AttemptStatus.SUBMITTED,
        started_at=datetime(2026, 4, 24, 20, 0, 0),
        submitted_at=datetime(2026, 4, 24, 20, 5, 0),
    )
    attempt.exam = exam
    attempt.student = student
    attempt.result = None

    timeline = _activity_timeline(
        [attempt],
        days=2,
        now=datetime(2026, 4, 25, 1, 0, 0),
    )

    assert timeline[-1]["date"] == "2026-04-25"
    assert timeline[-1]["label"] == "25 Apr IST"
    assert timeline[-1]["started"] == 1
    assert timeline[-1]["submitted"] == 1


def test_attempt_serialization_uses_authoritative_attempt_end_time() -> None:
    creator = make_user(2, UserRole.EXAMINER)
    student = make_user(9, UserRole.STUDENT)
    exam = make_exam(creator, duration_minutes=60)
    attempt = Attempt(
        id=401,
        exam_id=exam.id,
        student_id=student.id,
        status=AttemptStatus.IN_PROGRESS,
        started_at=datetime(2026, 4, 24, 10, 0, 0),
        submitted_at=None,
        ends_at=None,
        last_opened_at=None,
    )
    attempt.exam = exam
    attempt.student = student
    attempt.result = None

    assert _ensure_attempt_timing(attempt) is True

    payload = _serialize_attempt(
        attempt,
        now=attempt.started_at + timedelta(minutes=5),
    )

    assert attempt.ends_at == datetime(2026, 4, 24, 11, 0, 0)
    assert attempt.last_opened_at == datetime(2026, 4, 24, 10, 0, 0)
    assert payload["remaining_seconds"] == 3300


def test_start_attempt_rejects_wrong_password(monkeypatch: pytest.MonkeyPatch) -> None:
    fixed_now = datetime(2026, 4, 24, 10, 0, 0)
    monkeypatch.setattr(attempts_api, "_utcnow", lambda: fixed_now)

    creator = make_user(2, UserRole.EXAMINER)
    student = make_user(9, UserRole.STUDENT)
    exam = make_exam(
        creator,
        password_hash=get_password_hash("open-sesame"),
        duration_minutes=60,
    )
    exam.start_time = fixed_now - timedelta(minutes=5)
    assignment = Assignment(exam_id=exam.id, student_id=student.id)
    db = _FakeAsyncSession([exam, None, assignment])

    with pytest.raises(HTTPException, match="Incorrect exam password"):
        asyncio.run(
            start_attempt(
                exam.id,
                AttemptStartRequest(password="wrong-password"),
                db=db,
                current_user=student,
            )
        )


def test_start_attempt_resume_stays_available_after_schedule_window_closes(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    fixed_now = datetime(2026, 4, 24, 12, 0, 0)
    monkeypatch.setattr(attempts_api, "_utcnow", lambda: fixed_now)

    creator = make_user(2, UserRole.EXAMINER)
    student = make_user(9, UserRole.STUDENT)
    exam = make_exam(
        creator,
        password_hash=get_password_hash("resume-secret"),
        duration_minutes=60,
    )
    exam.start_time = fixed_now - timedelta(hours=2)
    attempt = Attempt(
        id=401,
        exam_id=exam.id,
        student_id=student.id,
        status=AttemptStatus.IN_PROGRESS,
        started_at=fixed_now - timedelta(minutes=20),
        ends_at=fixed_now + timedelta(minutes=15),
        last_opened_at=fixed_now - timedelta(minutes=10),
        submitted_at=None,
    )
    attempt.exam = exam
    attempt.student = student
    attempt.result = None

    db = _FakeAsyncSession([exam, attempt, attempt])
    response = asyncio.run(
        start_attempt(
            exam.id,
            AttemptStartRequest(password="resume-secret"),
            db=db,
            current_user=student,
        )
    )

    assert response["id"] == attempt.id
    assert response["status"] == AttemptStatus.IN_PROGRESS
    assert response["remaining_seconds"] == 900
    assert response["exam_access_token"] is None
    assert attempt.last_opened_at == fixed_now


def test_resume_attempt_without_password_configuration_when_password_is_disabled(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    fixed_now = datetime(2026, 4, 24, 12, 0, 0)
    monkeypatch.setattr(attempts_api, "_utcnow", lambda: fixed_now)

    creator = make_user(2, UserRole.EXAMINER)
    student = make_user(9, UserRole.STUDENT)
    exam = make_exam(creator, password_hash=None, duration_minutes=60)
    exam.start_time = fixed_now - timedelta(minutes=30)
    attempt = Attempt(
        id=402,
        exam_id=exam.id,
        student_id=student.id,
        status=AttemptStatus.IN_PROGRESS,
        started_at=fixed_now - timedelta(minutes=10),
        ends_at=fixed_now + timedelta(minutes=20),
        last_opened_at=fixed_now - timedelta(minutes=5),
        submitted_at=None,
    )
    attempt.exam = exam
    attempt.student = student
    attempt.result = None

    exam.password_required = False
    db = _FakeAsyncSession([exam, attempt, attempt])

    response = asyncio.run(
        start_attempt(
            exam.id,
            AttemptStartRequest(password=None),
            db=db,
            current_user=student,
        )
    )

    assert response["id"] == attempt.id
    assert response["status"] == AttemptStatus.IN_PROGRESS
    assert response["exam_access_token"] is None


def test_log_proctoring_event_records_flag_without_submitting_attempt(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    fixed_now = datetime(2026, 4, 24, 10, 0, 0)
    monkeypatch.setattr(attempts_api, "_utcnow", lambda: fixed_now)

    creator = make_user(2, UserRole.EXAMINER)
    student = make_user(9, UserRole.STUDENT)
    exam = make_exam(
        creator,
        password_hash=get_password_hash("focus-secret"),
        duration_minutes=60,
    )
    attempt = Attempt(
        id=501,
        exam_id=exam.id,
        student_id=student.id,
        status=AttemptStatus.IN_PROGRESS,
        started_at=fixed_now - timedelta(minutes=5),
        ends_at=fixed_now + timedelta(minutes=55),
        last_opened_at=fixed_now - timedelta(minutes=1),
        submitted_at=None,
    )
    attempt.exam = exam
    attempt.student = student
    attempt.result = None
    attempt.logs = []

    request = Request(
        {
            "type": "http",
            "headers": [],
        }
    )
    db = _FakeAsyncSession([attempt])

    response = asyncio.run(
        log_proctoring_event(
            attempt.id,
            ProctorLogCreate(
                event_type="TRUSTED_CONTEXT_EXIT",
                metadata_info='{"reason":"window_blur"}',
            ),
            request=request,
            db=db,
            current_user=student,
        )
    )

    assert response == {"status": "logged"}
    assert attempt.status == AttemptStatus.IN_PROGRESS
    logged_event = next(item for item in db.added if isinstance(item, ProctoringLog))
    assert logged_event.event_type == "TRUSTED_CONTEXT_EXIT"
    assert logged_event.metadata_info == '{"reason":"window_blur"}'
