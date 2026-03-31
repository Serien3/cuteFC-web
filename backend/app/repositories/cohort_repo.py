from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app import models


def create_dataset(session: Session, dataset: models.CohortDataset) -> models.CohortDataset:
    session.add(dataset)
    session.commit()
    session.refresh(dataset)
    return dataset


def get_dataset(session: Session, dataset_id: int) -> models.CohortDataset | None:
    return session.get(models.CohortDataset, dataset_id)


def list_datasets(session: Session) -> list[models.CohortDataset]:
    query = select(models.CohortDataset).order_by(models.CohortDataset.created_at.desc())
    return list(session.scalars(query))


def create_import_job(session: Session, job: models.CohortImportJob) -> models.CohortImportJob:
    session.add(job)
    session.commit()
    session.refresh(job)
    return job


def save_import_job(session: Session, job: models.CohortImportJob) -> models.CohortImportJob:
    session.add(job)
    session.commit()
    session.refresh(job)
    return job


def replace_dataset_summaries(
    session: Session, dataset_id: int, summaries: list[models.CohortVariantSummary]
) -> list[models.CohortVariantSummary]:
    session.execute(
        delete(models.CohortVariantSummary).where(models.CohortVariantSummary.dataset_id == dataset_id)
    )
    for summary in summaries:
        session.add(summary)
    session.commit()
    return summaries


def list_dataset_summaries(session: Session, dataset_id: int) -> list[models.CohortVariantSummary]:
    query = (
        select(models.CohortVariantSummary)
        .where(models.CohortVariantSummary.dataset_id == dataset_id)
        .order_by(models.CohortVariantSummary.frequency.desc(), models.CohortVariantSummary.pos.asc())
    )
    return list(session.scalars(query))
