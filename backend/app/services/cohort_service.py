from pathlib import Path

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.repositories import cohort_repo
from app.services.cohort_importer import count_cohort_samples, import_cohort_vcf


def create_dataset(session: Session, payload: schemas.CohortDatasetCreate) -> models.CohortDataset:
    dataset = models.CohortDataset(
        dataset_name=payload.dataset_name,
        source_path=payload.source_path,
        description=payload.description,
        import_status="pending",
    )
    return cohort_repo.create_dataset(session, dataset)


def list_datasets(session: Session) -> list[models.CohortDataset]:
    return cohort_repo.list_datasets(session)


def import_dataset(session: Session, dataset_id: int) -> schemas.CohortOverview:
    dataset = cohort_repo.get_dataset(session, dataset_id)
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")

    job = cohort_repo.create_import_job(
        session,
        models.CohortImportJob(dataset_id=dataset.id, status="running"),
    )
    job_id = job.id

    summary = import_cohort_vcf(Path(dataset.source_path))
    rows = [
        models.CohortVariantSummary(
            dataset_id=dataset.id,
            variant_key=item.variant_key,
            chrom=item.chrom,
            pos=item.pos,
            end=item.end,
            sv_type=item.sv_type,
            sample_count=item.sample_count,
            frequency=item.frequency,
            sample_list=item.sample_list,
            gene_name=item.gene_name,
        )
        for item in summary.summaries
    ]
    cohort_repo.replace_dataset_summaries(session, dataset.id, rows)
    dataset = cohort_repo.get_dataset(session, dataset_id)
    job = session.get(models.CohortImportJob, job_id)
    dataset.import_status = "succeeded"
    session.add(dataset)
    session.commit()

    job.status = "succeeded"
    cohort_repo.save_import_job(session, job)
    return get_overview(session, dataset.id)


def get_overview(session: Session, dataset_id: int) -> schemas.CohortOverview:
    dataset = cohort_repo.get_dataset(session, dataset_id)
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    summaries = cohort_repo.list_dataset_summaries(session, dataset.id)
    total_samples = count_cohort_samples(Path(dataset.source_path))
    return schemas.CohortOverview(
        dataset_id=dataset.id,
        dataset_name=dataset.dataset_name,
        total_sites=len(summaries),
        total_samples=total_samples,
        hotspot_count=sum(1 for item in summaries if item.frequency >= 0.5),
        rare_count=sum(1 for item in summaries if 0 < item.frequency <= 0.1),
    )


def get_hotspots(session: Session, dataset_id: int) -> list[schemas.CohortVariantRead]:
    summaries = cohort_repo.list_dataset_summaries(session, dataset_id)
    ranked = sorted(
        [item for item in summaries if item.frequency >= 0.5],
        key=lambda item: (-item.frequency, item.pos),
    )
    return [schemas.CohortVariantRead.model_validate(item) for item in ranked[:10]]


def get_rare(session: Session, dataset_id: int) -> list[schemas.CohortVariantRead]:
    summaries = cohort_repo.list_dataset_summaries(session, dataset_id)
    ranked = sorted(
        [item for item in summaries if 0 < item.frequency <= 0.1],
        key=lambda item: (item.frequency, item.pos),
    )
    return [schemas.CohortVariantRead.model_validate(item) for item in ranked[:10]]


def search(session: Session, dataset_id: int, query: schemas.CohortSearchQuery) -> list[schemas.CohortVariantRead]:
    summaries = cohort_repo.list_dataset_summaries(session, dataset_id)
    results = []
    for item in summaries:
        if query.gene_name and query.gene_name.lower() not in item.gene_name.lower():
            continue
        sample_names = [name.strip() for name in item.sample_list.split(",") if name.strip()]
        if query.sample_name and query.sample_name not in sample_names:
            continue
        if query.sv_type and item.sv_type != query.sv_type:
            continue
        if query.frequency_min is not None and item.frequency < query.frequency_min:
            continue
        if query.frequency_max is not None and item.frequency > query.frequency_max:
            continue
        if query.chrom and item.chrom != query.chrom:
            continue
        if query.start is not None and item.pos < query.start:
            continue
        if query.end is not None and item.end > query.end:
            continue
        results.append(item)
    return [schemas.CohortVariantRead.model_validate(item) for item in results]
