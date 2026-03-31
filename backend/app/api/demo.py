from fastapi import APIRouter, status

from app.dependencies import DbSession
from app.db import Base, engine
from app.schemas import DemoBootstrapRead
from app.services import demo_service

router = APIRouter(tags=["demo"])


@router.post("/demo/bootstrap", response_model=DemoBootstrapRead, status_code=status.HTTP_201_CREATED)
def bootstrap_demo(session: DbSession):
    # Make demo bootstrap resilient even if the app was started without running lifespan setup.
    Base.metadata.create_all(bind=engine)
    return demo_service.bootstrap_demo_data(session)
