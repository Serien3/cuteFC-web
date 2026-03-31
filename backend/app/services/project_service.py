from pathlib import Path

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.config import get_settings
from app.repositories import project_repo
from app.services.file_store import FileStore


def _build_task_summary(tasks: list[schemas.TaskRead]) -> schemas.TaskStatusSummary:
    pending = sum(task.status == "pending" for task in tasks)
    running = sum(task.status == "running" for task in tasks)
    succeeded = sum(task.status == "succeeded" for task in tasks)
    failed = sum(task.status == "failed" for task in tasks)
    return schemas.TaskStatusSummary(
        total=len(tasks),
        pending=pending,
        running=running,
        succeeded=succeeded,
        failed=failed,
        attention_count=pending + failed,
    )


def _get_project_or_404(session: Session, project_id: int) -> models.Project:
    project = project_repo.get_project(session, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


def create_project(session: Session, payload: schemas.ProjectCreate):
    return project_repo.create_project(session, payload)


def list_projects(session: Session):
    return project_repo.list_projects(session)


def get_project_detail(session: Session, project_id: int):
    from app.services import task_service

    project = _get_project_or_404(session, project_id)
    tasks = task_service.list_tasks(session)
    project_tasks = [task for task in tasks if task.project_id == project.id]
    return schemas.ProjectDetail.model_validate(
        {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "samples": project.samples,
            "files": project.files,
            "task_summary": _build_task_summary(project_tasks),
            "recent_tasks": project_tasks[:5],
        }
    )


def update_project(session: Session, project_id: int, payload: schemas.ProjectUpdate):
    project = _get_project_or_404(session, project_id)
    return project_repo.update_project(session, project, payload)


def delete_project(session: Session, project_id: int) -> None:
    project = _get_project_or_404(session, project_id)
    project_repo.delete_project(session, project)


def create_sample(session: Session, project_id: int, payload: schemas.SampleCreate):
    _get_project_or_404(session, project_id)
    return project_repo.create_sample(session, project_id, payload)


def register_input_file(session: Session, payload: schemas.InputFileCreate):
    _get_project_or_404(session, payload.project_id)
    if payload.sample_id is not None:
        sample = session.get(models.Sample, payload.sample_id)
        if sample is None or sample.project_id != payload.project_id:
            raise HTTPException(status_code=404, detail="Sample not found")
    return project_repo.register_input_file(session, payload)


def list_input_files(session: Session, project_id: int | None = None):
    return project_repo.list_input_files(session, project_id)


def get_file_store() -> FileStore:
    settings = get_settings()
    return FileStore(Path(settings.data_root))
