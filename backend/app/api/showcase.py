from fastapi import APIRouter

from app.dependencies import DbSession
from app.services import showcase_service

router = APIRouter(tags=["showcase"])


@router.get("/showcase/dashboard")
def get_dashboard(session: DbSession):
    return showcase_service.get_dashboard_payload(session)


@router.get("/showcase/page")
def get_showcase_page():
    return showcase_service.get_showcase_payload()

