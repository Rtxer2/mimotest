from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, get_current_active_user
from app.models.user import User
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    service = AnalyticsService(db)
    return service.get_dashboard()
