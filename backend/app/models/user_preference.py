from sqlalchemy import Column, Integer, ForeignKey, JSON
from app.models.base import BaseModel


class UserPreferences(BaseModel):
    __tablename__ = "user_preferences"

    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    dashboard_config = Column(JSON, default=dict)
