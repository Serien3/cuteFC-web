from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from fastapi.responses import FileResponse

from app.dependencies import DbSession
from app.schemas import ResultSummary, ResultVariantDetail, ResultVariantQuery, ResultVariantRead
from app.services import result_service

router = APIRouter(tags=["results"])


@router.get("/results/{task_id}/summary", response_model=ResultSummary)
def get_result_summary(task_id: int, session: DbSession):
    return result_service.get_result_summary(session, task_id)


@router.get("/results/{task_id}/variants", response_model=list[ResultVariantRead])
def get_result_variants(task_id: int, session: DbSession):
    return result_service.get_result_variants(session, task_id)


@router.post("/results/{task_id}/variants/query", response_model=list[ResultVariantRead])
def query_result_variants(task_id: int, payload: ResultVariantQuery, session: DbSession):
    return result_service.get_result_variants(session, task_id, payload)


@router.post("/results/{task_id}/variants/export/{export_format}", response_class=PlainTextResponse)
def export_result_variants(
    task_id: int,
    export_format: str,
    payload: ResultVariantQuery,
    session: DbSession,
):
    return result_service.export_result_variants(session, task_id, payload, export_format)


@router.get("/results/variants/{variant_id}", response_model=ResultVariantDetail)
def get_result_variant_detail(variant_id: int, session: DbSession):
    return result_service.get_result_variant_detail(session, variant_id)


@router.get("/results/variants/{variant_id}/assets/{asset_kind}")
def get_result_variant_asset(variant_id: int, asset_kind: str, session: DbSession):
    path = result_service.get_result_variant_asset_path(session, variant_id, asset_kind)
    return FileResponse(path)
