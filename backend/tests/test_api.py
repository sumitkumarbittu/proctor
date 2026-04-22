import pytest
from httpx import AsyncClient
from app.core.config import settings

@pytest.mark.asyncio
async def test_root(client: AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Online Examination System API"}

@pytest.mark.asyncio
async def test_login_fail(client: AsyncClient):
    # This hits /api/v1/auth/login
    url = f"{settings.API_V1_STR}/auth/login"
    # Form data for OAuth2PasswordRequestForm
    response = await client.post(url, data={"username": "wrong@example.com", "password": "wrongpassword"})
    assert response.status_code == 400
