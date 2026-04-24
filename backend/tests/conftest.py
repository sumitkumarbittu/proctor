import asyncio
import pytest
from typing import AsyncGenerator
from httpx import AsyncClient

try:
    import pytest_asyncio
except ModuleNotFoundError:  # pragma: no cover - local test environments may omit async extras
    pytest_asyncio = None

# Use an in-memory SQLite for testing or a separate test DB.
# For simplicity with asyncpg, we reuse the Postgres connection but roll back transactions?
# Or use a test database like `proctor_test`.
# Since we are inside docker we can use the same DB or separate.
# Best practice: override dependency to use sqlite in-memory for unit tests if code is compatible (SQLAlchemy helps).
# But we are using asyncpg specific features maybe? Standard SQLAlchemy is compatible.
# However, async sqlite requires aiosqlite. I'll stick to overriding get_db or mocking.
# For simplicity, let's use a very basic check.

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

if pytest_asyncio:

    @pytest_asyncio.fixture
    async def client() -> AsyncGenerator[AsyncClient, None]:
        from app.main import app

        async with AsyncClient(app=app, base_url="http://test") as c:
            yield c

else:

    @pytest.fixture
    def client() -> AsyncGenerator[AsyncClient, None]:
        pytest.skip("pytest_asyncio is not installed in this environment")
