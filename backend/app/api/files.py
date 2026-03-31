from fastapi import APIRouter, Query, status

from app.dependencies import DbSession
from app.schemas import InputFileCreate, InputFileRead
from app.services import project_service

router = APIRouter(tags=["files"])


@router.post("/files", response_model=InputFileRead, status_code=status.HTTP_201_CREATED)
def register_file(payload: InputFileCreate, session: DbSession):
    return project_service.register_input_file(session, payload)


@router.get("/files", response_model=list[InputFileRead])
def list_files(session: DbSession, project_id: int | None = Query(default=None)):
    return project_service.list_input_files(session, project_id)
