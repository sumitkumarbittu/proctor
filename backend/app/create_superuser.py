import asyncio
import logging
from app.db.session import get_engine, get_session_factory
from app.db import base  # Ensure all models are registered
from app.models.user import User, UserRole
from app.core import security
from sqlalchemy import select

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db() -> None:
    get_engine()
    session_factory = get_session_factory()

    async with session_factory() as db:
        result = await db.execute(select(User).filter(User.email == "admin@example.com"))
        user = result.scalars().first()
        if not user:
            user = User(
                email="admin@example.com",
                password_hash=security.get_password_hash("password"), # Change in production
                name="Admin User",
                role=UserRole.ADMIN,
                is_active=True,
            )
            db.add(user)
            await db.commit()
            logger.info("Superuser created")
        else:
            logger.info("Superuser already exists")

def main() -> None:
    logger.info("Creating initial data")
    asyncio.run(init_db())
    logger.info("Initial data created")

if __name__ == "__main__":
    main()
