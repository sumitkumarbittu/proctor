from fastapi import APIRouter
from app.api.v1 import auth, users, exams, attempts, reports, trash

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(exams.router, prefix="/exams", tags=["exams"])
api_router.include_router(attempts.router, prefix="/attempts", tags=["attempts"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(trash.router, prefix="/trash", tags=["trash"])
