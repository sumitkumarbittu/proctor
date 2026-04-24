from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = None
AsyncSessionLocal = None


def get_engine():
    global engine, AsyncSessionLocal

    if engine is None:
        engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI, future=True, echo=True)
        AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    return engine


def get_session_factory():
    if AsyncSessionLocal is None:
        get_engine()
    return AsyncSessionLocal

async def get_db():
    session_factory = get_session_factory()
    async with session_factory() as session:
        yield session
