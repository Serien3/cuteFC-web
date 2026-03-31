from fastapi import APIRouter, status

from app.dependencies import DbSession
from app.schemas import (
    CohortDatasetCreate,
    CohortDatasetRead,
    CohortOverview,
    CohortSearchQuery,
    CohortVariantRead,
)
from app.services import cohort_service

router = APIRouter(tags=["cohort"])


@router.post("/cohort/datasets", response_model=CohortDatasetRead, status_code=status.HTTP_201_CREATED)
def create_dataset(payload: CohortDatasetCreate, session: DbSession):
    return cohort_service.create_dataset(session, payload)


@router.get("/cohort/datasets", response_model=list[CohortDatasetRead])
def list_datasets(session: DbSession):
    return cohort_service.list_datasets(session)


@router.post("/cohort/datasets/{dataset_id}/import", response_model=CohortOverview)
def import_dataset(dataset_id: int, session: DbSession):
    return cohort_service.import_dataset(session, dataset_id)


@router.get("/cohort/datasets/{dataset_id}/overview", response_model=CohortOverview)
def get_overview(dataset_id: int, session: DbSession):
    return cohort_service.get_overview(session, dataset_id)


@router.get("/cohort/datasets/{dataset_id}/hotspots", response_model=list[CohortVariantRead])
def get_hotspots(dataset_id: int, session: DbSession):
    return cohort_service.get_hotspots(session, dataset_id)


@router.get("/cohort/datasets/{dataset_id}/rare", response_model=list[CohortVariantRead])
def get_rare(dataset_id: int, session: DbSession):
    return cohort_service.get_rare(session, dataset_id)


@router.post("/cohort/datasets/{dataset_id}/search", response_model=list[CohortVariantRead])
def search(dataset_id: int, payload: CohortSearchQuery, session: DbSession):
    return cohort_service.search(session, dataset_id, payload)
