from fastapi import APIRouter, Response, status

from app.dependencies import DbSession
from app.schemas import (
    ProjectCreate,
    ProjectDetail,
    ProjectRead,
    ProjectUpdate,
    SampleCreate,
    SampleRead,
)
from app.services import project_service

router = APIRouter(tags=["projects"])


@router.post("/projects", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, session: DbSession):
    return project_service.create_project(session, payload)


@router.get("/projects", response_model=list[ProjectRead])
def list_projects(session: DbSession):
    return project_service.list_projects(session)


@router.get("/projects/{project_id}", response_model=ProjectDetail)
def get_project(project_id: int, session: DbSession):
    return project_service.get_project_detail(session, project_id)


@router.put("/projects/{project_id}", response_model=ProjectRead)
def update_project(project_id: int, payload: ProjectUpdate, session: DbSession):
    return project_service.update_project(session, project_id, payload)


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, session: DbSession):
    project_service.delete_project(session, project_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/projects/{project_id}/samples",
    response_model=SampleRead,
    status_code=status.HTTP_201_CREATED,
)
def create_sample(project_id: int, payload: SampleCreate, session: DbSession):
    return project_service.create_sample(session, project_id, payload)
