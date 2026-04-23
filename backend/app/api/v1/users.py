from typing import Any, List, Optional
from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from pydantic.networks import EmailStr
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_, select

from app.api import deps
from app.core.config import settings
from app.core import security
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, User as UserSchema

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
async def read_users(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    role: Optional[UserRole] = None,
    q: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_examiner),
) -> Any:
    """
    Retrieve users for management or assignment lookups.
    """
    stmt = select(User)

    if role is not None:
        stmt = stmt.filter(User.role == role)

    if q:
        like_value = f"%{q.strip()}%"
        stmt = stmt.filter(or_(User.name.ilike(like_value), User.email.ilike(like_value)))

    result = await db.execute(stmt.order_by(User.name.is_(None), User.name.asc(), User.email.asc()).offset(skip).limit(limit))
    return result.scalars().all()


@router.post("/", response_model=UserSchema)
async def create_user(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new user.
    """
    result = await db.execute(select(User).filter(User.email == user_in.email))
    user = result.scalars().first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = User(
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        name=user_in.name,
        role=user_in.role,
        is_active=user_in.is_active,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.get("/me", response_model=UserSchema)
async def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a user (admin only).
    """
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_in.name is not None:
        user.name = user_in.name
    if user_in.email is not None:
        user.email = user_in.email
    if user_in.role is not None:
        user.role = user_in.role
    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    if user_in.password:
        user.password_hash = security.get_password_hash(user_in.password)

    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a user (admin only).
    """
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()
    return {"status": "deleted", "id": user_id}
