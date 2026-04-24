from pathlib import Path
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parents[2]
_REPO_DIR = _BACKEND_DIR.parent if _BACKEND_DIR.name == "backend" else _BACKEND_DIR
_ENV_FILES = (
    _REPO_DIR / ".env.example",
    _BACKEND_DIR / ".env.example",
    _REPO_DIR / ".env",
    _BACKEND_DIR / ".env",
)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=tuple(str(path) for path in _ENV_FILES),
    )

    PROJECT_NAME: str = "Online Examination and Proctoring System"
    API_V1_STR: str = "/api/v1"
    
    # Database Configuration with Defaults for Local Development
    POSTGRES_SERVER: Optional[str] = "localhost"
    POSTGRES_USER: Optional[str] = "postgres"
    POSTGRES_PASSWORD: Optional[str] = "postgres"
    POSTGRES_DB: Optional[str] = "proctor"
    POSTGRES_PORT: Optional[str] = "5432"
    
    # Single Connection URL Support
    DATABASE_URL: Optional[str] = None
    
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL.strip()
            if len(url) >= 2 and url[0] == url[-1] and url[0] in {"'", '"'}:
                url = url[1:-1]
            # asyncpg requires the 'postgresql+asyncpg://' scheme
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return url
        
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
