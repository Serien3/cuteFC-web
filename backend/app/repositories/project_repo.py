from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app import models, schemas


def create_project(session: Session, payload: schemas.ProjectCreate) -> models.Project:
    project = models.Project(name=payload.name, description=payload.description)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


def list_projects(session: Session) -> list[models.Project]:
    return list(session.scalars(select(models.Project).order_by(models.Project.created_at.desc())))


def get_project(session: Session, project_id: int) -> models.Project | None:
    query = (
        select(models.Project)
        .where(models.Project.id == project_id)
        .options(selectinload(models.Project.samples), selectinload(models.Project.files))
    )
    return session.scalar(query)


def update_project(
    session: Session, project: models.Project, payload: schemas.ProjectUpdate
) -> models.Project:
    project.name = payload.name
    project.description = payload.description
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


def delete_project(session: Session, project: models.Project) -> None:
    session.delete(project)
    session.commit()


def create_sample(session: Session, project_id: int, payload: schemas.SampleCreate) -> models.Sample:
    sample = models.Sample(
        project_id=project_id,
        sample_name=payload.sample_name,
        platform_type=payload.platform_type,
        remark=payload.remark,
    )
    session.add(sample)
    session.commit()
    session.refresh(sample)
    return sample


def register_input_file(session: Session, payload: schemas.InputFileCreate) -> models.InputFile:
    input_file = models.InputFile(
        project_id=payload.project_id,
        sample_id=payload.sample_id,
        file_type=payload.file_type,
        file_path=payload.file_path,
        status=payload.status,
    )
    session.add(input_file)
    session.commit()
    session.refresh(input_file)
    return input_file


def list_input_files(session: Session, project_id: int | None = None) -> list[models.InputFile]:
    query = select(models.InputFile).order_by(models.InputFile.created_at.desc())
    if project_id is not None:
        query = query.where(models.InputFile.project_id == project_id)
    return list(session.scalars(query))
