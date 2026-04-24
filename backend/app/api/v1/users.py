from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.core import security
from app.models.trash import TrashedItem, TrashEntityType
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, User as UserSchema

router = APIRouter()

MANAGED_EXAMINER_ROLES = {UserRole.STUDENT, UserRole.EXAMINER}


async def _get_user_or_404(db: AsyncSession, user_id: int) -> User:
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def _ensure_role_assignment_allowed(operator: User, role: UserRole) -> None:
    if operator.role == UserRole.ADMIN:
        return
    if role not in MANAGED_EXAMINER_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Examiners can only assign student or examiner roles",
        )


def _build_user_permissions(target: User, operator: User) -> dict[str, Any]:
    is_self = target.id == operator.id
    protected_reason: str | None = None

    if operator.role == UserRole.ADMIN:
        if is_self:
            protected_reason = "Your access is protected from this screen."
        return {
            "can_edit": not is_self,
            "can_remove_access": not is_self,
            "can_change_role": not is_self,
            "can_toggle_active": not is_self,
            "can_delete": not is_self,
            "protected_reason": protected_reason,
        }

    can_manage = (
        operator.role == UserRole.EXAMINER
        and not is_self
        and target.role in MANAGED_EXAMINER_ROLES
    )

    if is_self:
        protected_reason = "You cannot change your own access."
    elif target.role == UserRole.ADMIN:
        protected_reason = "Admin access is protected."

    return {
        "can_edit": can_manage,
        "can_remove_access": can_manage,
        "can_change_role": can_manage,
        "can_toggle_active": can_manage,
        "can_delete": False,
        "protected_reason": protected_reason,
    }


def _serialize_user(target: User, operator: User) -> dict[str, Any]:
    payload = {
        "id": target.id,
        "email": target.email,
        "name": target.name,
        "role": target.role,
        "is_active": target.is_active,
    }
    payload.update(_build_user_permissions(target, operator))
    return payload


async def _ensure_email_available(
    db: AsyncSession,
    email: str,
    *,
    exclude_user_id: int | None = None,
) -> None:
    result = await db.execute(select(User).filter(User.email == email))
    existing = result.scalars().first()
    if existing and existing.id != exclude_user_id:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )


def _ensure_user_update_allowed(operator: User, target: User, user_in: UserUpdate) -> None:
    if operator.role == UserRole.EXAMINER:
        if target.id == operator.id:
            raise HTTPException(status_code=403, detail="You cannot change your own access")
        if target.role == UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Examiners cannot change admin access")
        if user_in.role is not None:
            _ensure_role_assignment_allowed(operator, user_in.role)
        return

    if target.id != operator.id:
        return

    if user_in.role is not None and user_in.role != UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="You cannot change your own admin role")
    if user_in.is_active is False:
        raise HTTPException(status_code=400, detail="You cannot remove your own access")


@router.get("/", response_model=List[UserSchema])
async def read_users(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    role: Optional[UserRole] = None,
    q: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """Retrieve users for management and assignment lookups."""
    stmt = select(User)

    if role is not None:
        stmt = stmt.filter(User.role == role)

    if q:
        like_value = f"%{q.strip()}%"
        stmt = stmt.filter(or_(User.name.ilike(like_value), User.email.ilike(like_value)))

    result = await db.execute(
        stmt.order_by(User.role.asc(), User.name.is_(None), User.name.asc(), User.email.asc())
        .offset(skip)
        .limit(limit)
    )
    users = result.scalars().all()
    return [_serialize_user(user, current_user) for user in users]


@router.post("/", response_model=UserSchema)
async def create_user(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """Create a new user."""
    _ensure_role_assignment_allowed(current_user, user_in.role)
    await _ensure_email_available(db, user_in.email)

    user = User(
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        name=user_in.name,
        role=user_in.role,
        is_active=user_in.is_active if user_in.is_active is not None else True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return _serialize_user(user, current_user)


@router.get("/me", response_model=UserSchema)
async def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get the current user."""
    return _serialize_user(current_user, current_user)


@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """Update a user while respecting role boundaries."""
    user = await _get_user_or_404(db, user_id)
    _ensure_user_update_allowed(current_user, user, user_in)

    if user_in.email is not None:
        await _ensure_email_available(db, user_in.email, exclude_user_id=user.id)
        user.email = user_in.email
    if user_in.name is not None:
        user.name = user_in.name
    if user_in.role is not None:
        _ensure_role_assignment_allowed(current_user, user_in.role)
        user.role = user_in.role
    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    if user_in.password:
        user.password_hash = security.get_password_hash(user_in.password)

    await db.commit()
    await db.refresh(user)
    return _serialize_user(user, current_user)


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Soft-delete a user into Recently Deleted."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    user = await _get_user_or_404(db, user_id)
    snapshot = jsonable_encoder(
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "password_hash": user.password_hash,
        }
    )
    db.add(
        TrashedItem(
            entity_type=TrashEntityType.USER,
            original_id=user.id,
            label=user.name or user.email,
            snapshot=snapshot,
            deleted_by=current_user.id,
        )
    )
    await db.delete(user)
    await db.commit()
    return {"status": "deleted", "id": user_id}
