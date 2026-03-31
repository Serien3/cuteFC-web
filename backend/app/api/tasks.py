from fastapi import APIRouter, status

from app.dependencies import DbSession
from app.schemas import TaskCreate, TaskLogRead, TaskRead
from app.services import task_service

router = APIRouter(tags=["tasks"])


@router.post("/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, session: DbSession):
    return task_service.create_task_detail(session, payload)


@router.get("/tasks", response_model=list[TaskRead])
def list_tasks(session: DbSession):
    return task_service.list_tasks(session)


@router.get("/tasks/{task_id}", response_model=TaskRead)
def get_task(task_id: int, session: DbSession):
    return task_service.get_task_detail(session, task_id)


@router.get("/tasks/{task_id}/logs", response_model=TaskLogRead)
def get_task_log(task_id: int, session: DbSession):
    return task_service.get_task_log(session, task_id)


@router.post("/tasks/{task_id}/run", response_model=TaskRead)
def run_task(task_id: int, session: DbSession):
    return task_service.run_task(session, task_id)
