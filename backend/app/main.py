from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.session import get_session_factory

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    cors_origins = [str(origin) for origin in settings.BACKEND_CORS_ORIGINS]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials="*" not in cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health")
async def healthcheck():
    """Lightweight readiness probe for hosted web services."""
    return {"status": "ok"}


@app.get("/health/db")
async def database_healthcheck():
    """Optional deep health probe for validating database connectivity."""
    try:
        session_factory = get_session_factory()
        async with session_factory() as session:
            await session.execute(text("SELECT 1"))
    except Exception as error:  # pragma: no cover - exercised by container health checks
        raise HTTPException(status_code=503, detail="Database unavailable") from error

    return {
        "status": "ok",
        "project": settings.PROJECT_NAME,
    }


@app.get("/")
def root():
    return {"message": "Welcome to Online Examination System API"}
