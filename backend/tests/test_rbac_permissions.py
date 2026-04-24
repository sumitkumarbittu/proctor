import pytest
from fastapi import HTTPException

from app.api.v1.exams import (
    _exam_query,
    _ensure_question_owner_access,
    _question_query,
    _question_is_accessible,
    _serialize_folder,
)
from app.api.v1.trash import _can_manage_trash_item
from app.api.v1.users import _build_user_permissions, _ensure_user_update_allowed
from app.models.exam import Question, QuestionFolder, QuestionFolderShare, QuestionType
from app.models.trash import TrashEntityType, TrashedItem
from app.models.user import User, UserRole
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
