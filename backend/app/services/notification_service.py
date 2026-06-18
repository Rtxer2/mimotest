from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.notification import Notification, NotificationRule
from app.models.user import User


class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def create_notification(
        self,
        event_type: str,
        title: str,
        content: str,
        link: str = "",
        notification_type: str = "info"
    ):
        rules = self.db.query(NotificationRule).filter(
            and_(
                NotificationRule.event_type == event_type,
                NotificationRule.is_active == True
            )
        ).all()

        user_ids = set()
        for rule in rules:
            if rule.user_id:
                user_ids.add(rule.user_id)
            elif rule.role:
                role_users = self.db.query(User).filter(
                    and_(User.role == rule.role, User.is_active == True)
                ).all()
                for user in role_users:
                    user_ids.add(user.id)

        for user_id in user_ids:
            notification = Notification(
                user_id=user_id,
                title=title,
                content=content,
                type=notification_type,
                link=link
            )
            self.db.add(notification)

        self.db.commit()

    def get_user_notifications(self, user_id: int, skip: int = 0, limit: int = 20):
        return self.db.query(Notification).filter(
            Notification.user_id == user_id
        ).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

    def get_unread_count(self, user_id: int) -> int:
        return self.db.query(Notification).filter(
            and_(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
        ).count()

    def mark_as_read(self, notification_id: int, user_id: int):
        notification = self.db.query(Notification).filter(
            and_(
                Notification.id == notification_id,
                Notification.user_id == user_id
            )
        ).first()
        if notification:
            notification.is_read = True
            self.db.commit()
            return True
        return False

    def mark_all_as_read(self, user_id: int):
        self.db.query(Notification).filter(
            and_(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
        ).update({"is_read": True})
        self.db.commit()

    def list_rules(self, skip: int = 0, limit: int = 100):
        return self.db.query(NotificationRule).offset(skip).limit(limit).all()

    def get_rule(self, rule_id: int):
        return self.db.query(NotificationRule).filter(NotificationRule.id == rule_id).first()

    def create_rule(self, event_type: str, role: str | None = None, user_id: int | None = None):
        rule = NotificationRule(event_type=event_type, role=role, user_id=user_id)
        self.db.add(rule)
        self.db.commit()
        self.db.refresh(rule)
        return rule

    def update_rule(self, rule_id: int, **kwargs):
        rule = self.get_rule(rule_id)
        if not rule:
            return None
        for key, value in kwargs.items():
            if value is not None:
                setattr(rule, key, value)
        self.db.commit()
        self.db.refresh(rule)
        return rule

    def delete_rule(self, rule_id: int):
        rule = self.get_rule(rule_id)
        if not rule:
            return False
        self.db.delete(rule)
        self.db.commit()
        return True
