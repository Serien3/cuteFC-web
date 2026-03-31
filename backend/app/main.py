from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import cohort, demo, files, projects, results, showcase, tasks
from app.config import get_settings
from app.db import engine, ensure_runtime_schema, ensure_tables
from app.services.project_service import get_file_store


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    Path(settings.data_root).mkdir(parents=True, exist_ok=True)
    get_file_store().ensure_base_dirs()
    ensure_tables()
    ensure_runtime_schema()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="cuteFC GUI API", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(projects.router)
    app.include_router(files.router)
    app.include_router(tasks.router)
    app.include_router(results.router)
    app.include_router(cohort.router)
    app.include_router(showcase.router)
    app.include_router(demo.router)
    return app


app = create_app()
