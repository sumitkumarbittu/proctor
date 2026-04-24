import asyncio

from sqlalchemy import text

from app.db.session import get_engine


async def main() -> None:
    engine = get_engine()
    async with engine.begin() as connection:
        await connection.execute(text("DROP TABLE IF EXISTS alembic_version"))
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
