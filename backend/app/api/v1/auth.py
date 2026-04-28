from typing import Any
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.token import Token

router = APIRouter()
AUTH_COOKIE_NAME = "oeps_access_token"

@router.post("/login", response_model=Token)
async def login_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Find user
    result = await db.execute(select(User).filter(User.email == form_data.username))
    user = result.scalars().first()

    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    elif not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user.id, role=user.role, expires_delta=access_token_expires
    )
    response.set_cookie(
        AUTH_COOKIE_NAME,
        access_token,
        max_age=int(access_token_expires.total_seconds()),
        httponly=True,
        samesite="lax",
        secure=False,
    )
    return {
        "access_token": "",
        "token_type": "bearer",
    }


@router.post("/logout")
async def logout(response: Response) -> dict[str, str]:
    response.delete_cookie(AUTH_COOKIE_NAME, samesite="lax", secure=False)
    return {"status": "logged_out"}
