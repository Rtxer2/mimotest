from datetime import datetime
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    content: str
    type: str
    is_read: bool
    link: str
    created_at: datetime

    class Config:
        from_attributes = True


class UnreadCountResponse(BaseModel):
    count: int


class NotificationRuleCreate(BaseModel):
    event_type: str
    role: str | None = None
    user_id: int | None = None


class NotificationRuleUpdate(BaseModel):
    event_type: str | None = None
    role: str | None = None
    user_id: int | None = None
    is_active: bool | None = None


class NotificationRuleResponse(BaseModel):
    id: int
    event_type: str
    role: str | None
    user_id: int | None
    is_active: bool

    class Config:
        from_attributes = True
