from pathlib import Path
import json
from typing import Any, List, Optional
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parents[2]
_REPO_DIR = _BACKEND_DIR.parent if _BACKEND_DIR.name == "backend" else _BACKEND_DIR
_ENV_FILES = (
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
    SQLALCHEMY_ECHO: bool = False
    DB_POOL_SIZE: int = 3
    DB_MAX_OVERFLOW: int = 0
    DB_POOL_TIMEOUT: int = 10
    DB_POOL_RECYCLE_SECONDS: int = 1800

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, value: Any) -> list[str] | str:
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            if stripped.startswith("["):
                return json.loads(stripped)
            return [origin.strip() for origin in stripped.split(",") if origin.strip()]
        return value

    def _normalize_database_url(self, url: str) -> tuple[str, dict[str, Any]]:
        cleaned = url.strip()
        if len(cleaned) >= 2 and cleaned[0] == cleaned[-1] and cleaned[0] in {"'", '"'}:
            cleaned = cleaned[1:-1]
        if cleaned.startswith("postgres://"):
            cleaned = cleaned.replace("postgres://", "postgresql+asyncpg://", 1)
        elif cleaned.startswith("postgresql://"):
            cleaned = cleaned.replace("postgresql://", "postgresql+asyncpg://", 1)

        parts = urlsplit(cleaned)
        query = dict(parse_qsl(parts.query, keep_blank_values=True))
        sslmode = query.pop("sslmode", None)
        connect_args: dict[str, Any] = {}
        if sslmode and sslmode.lower() not in {"disable", "allow", "prefer"}:
            connect_args["ssl"] = True

        normalized = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))
        return normalized, connect_args

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DATABASE_URL:
            url, _ = self._normalize_database_url(self.DATABASE_URL)
            return url
        
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def SQLALCHEMY_CONNECT_ARGS(self) -> dict[str, Any]:
        if not self.DATABASE_URL:
            return {}
        _, connect_args = self._normalize_database_url(self.DATABASE_URL)
        return connect_args

settings = Settings()
