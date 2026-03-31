from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models


def create_task(session: Session, task: models.AnalysisTask) -> models.AnalysisTask:
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def list_tasks(session: Session) -> list[models.AnalysisTask]:
    return list(session.scalars(select(models.AnalysisTask).order_by(models.AnalysisTask.created_at.desc())))


def get_task(session: Session, task_id: int) -> models.AnalysisTask | None:
    return session.get(models.AnalysisTask, task_id)


def save(session: Session, task: models.AnalysisTask) -> models.AnalysisTask:
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
