import os
from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel, Field


def _split_env_list(name: str, default: list[str]) -> list[str]:
    value = os.getenv(name)
    if not value:
        return default
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings(BaseModel):
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./data/app.db")
    data_root: Path = Path(os.getenv("DATA_ROOT", "./data"))
    cors_origins: list[str] = Field(
        default_factory=lambda: _split_env_list(
            "CORS_ORIGINS",
            [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:4173",
                "http://127.0.0.1:4173",
            ],
        )
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
