from sqlalchemy import Column, String, Integer, Text, Boolean
from app.models.base import BaseModel


class Notification(BaseModel):
    __tablename__ = "notifications"

    user_id = Column(Integer, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, default="")
    type = Column(String(50), default="info")
    is_read = Column(Boolean, default=False)
    link = Column(String(500), default="")


class NotificationRule(BaseModel):
    __tablename__ = "notification_rules"

    event_type = Column(String(50), nullable=False, index=True)
    role = Column(String(20), nullable=True)
    user_id = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
