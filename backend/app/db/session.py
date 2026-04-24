from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = None
AsyncSessionLocal = None


def get_engine():
    global engine, AsyncSessionLocal

    if engine is None:
        engine = create_async_engine(
            settings.SQLALCHEMY_DATABASE_URI,
            future=True,
            echo=settings.SQLALCHEMY_ECHO,
            pool_size=settings.DB_POOL_SIZE,
            max_overflow=settings.DB_MAX_OVERFLOW,
            pool_timeout=settings.DB_POOL_TIMEOUT,
            pool_recycle=settings.DB_POOL_RECYCLE_SECONDS,
            pool_pre_ping=True,
            connect_args=settings.SQLALCHEMY_CONNECT_ARGS,
        )
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
