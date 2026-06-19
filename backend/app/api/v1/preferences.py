from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db_session, get_current_active_user
from app.models.user import User
from app.services.preference_service import PreferenceService

router = APIRouter()


@router.get("/me")
def get_my_preferences(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    service = PreferenceService(db)
    return service.get_preferences(current_user.id)


@router.put("/me")
def save_my_preferences(
    config: dict,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    service = PreferenceService(db)
    return service.save_preferences(current_user.id, config)
