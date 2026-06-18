from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_admin
from app.models.user import User
from app.schemas.notification import (
    NotificationResponse, UnreadCountResponse,
    NotificationRuleCreate, NotificationRuleUpdate, NotificationRuleResponse
)
from app.services.notification_service import NotificationService
from app.api.deps import get_current_active_user

router = APIRouter()


@router.get("", response_model=list[NotificationResponse])
def list_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db_session)
):
    service = NotificationService(db)
    return service.get_user_notifications(current_user.id, skip=skip, limit=limit)


@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db_session)
):
    service = NotificationService(db)
    count = service.get_unread_count(current_user.id)
    return {"count": count}


@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db_session)
):
    service = NotificationService(db)
    if not service.mark_as_read(notification_id, current_user.id):
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Marked as read"}


@router.put("/read-all")
def mark_all_as_read(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db_session)
):
    service = NotificationService(db)
    service.mark_all_as_read(current_user.id)
    return {"message": "All notifications marked as read"}


@router.get("/rules", response_model=list[NotificationRuleResponse])
def list_rules(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db_session)
):
    service = NotificationService(db)
    return service.list_rules(skip=skip, limit=limit)


@router.post("/rules", response_model=NotificationRuleResponse)
def create_rule(
    data: NotificationRuleCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db_session)
):
    service = NotificationService(db)
    return service.create_rule(data.event_type, data.role, data.user_id)


@router.put("/rules/{rule_id}", response_model=NotificationRuleResponse)
def update_rule(
    rule_id: int,
    data: NotificationRuleUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db_session)
):
    service = NotificationService(db)
    rule = service.update_rule(rule_id, **data.model_dump(exclude_unset=True))
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    return rule


@router.delete("/rules/{rule_id}")
def delete_rule(
    rule_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db_session)
):
    service = NotificationService(db)
    if not service.delete_rule(rule_id):
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"message": "Rule deleted"}
