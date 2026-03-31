from collections.abc import Generator

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


settings = get_settings()
connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def ensure_tables(bind=None) -> None:
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=bind or engine)


def ensure_runtime_schema(bind=None) -> None:
    target = bind or engine
    if target.dialect.name != "sqlite":
        return

    inspector = inspect(target)
    if not inspector.has_table("analysis_tasks"):
        return

    columns = {column["name"] for column in inspector.get_columns("analysis_tasks")}
    statements: list[str] = []
    if "started_at" not in columns:
        statements.append("ALTER TABLE analysis_tasks ADD COLUMN started_at DATETIME")
    if "finished_at" not in columns:
        statements.append("ALTER TABLE analysis_tasks ADD COLUMN finished_at DATETIME")

    if not statements:
        return

    with target.begin() as connection:
        for statement in statements:
            connection.exec_driver_sql(statement)


def get_db_session() -> Generator:
    ensure_runtime_schema()
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
