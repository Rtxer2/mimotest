from sqlalchemy.orm import Session
from app.models.user_preference import UserPreferences

DEFAULT_CONFIG = {
    "dashboard": {
        "customers": True,
        "orders": True,
        "production": True,
        "quality": True,
    },
    "analytics": {
        "metrics": True,
        "order_trend": True,
        "order_status": True,
        "production_stats": True,
        "inventory_stats": True,
        "quality_stats": True,
        "approval_stats": True,
    },
}


class PreferenceService:
    def __init__(self, db: Session):
        self.db = db

    def get_preferences(self, user_id: int) -> dict:
        pref = self.db.query(UserPreferences).filter(
            UserPreferences.user_id == user_id
        ).first()
        if pref and pref.dashboard_config:
            return pref.dashboard_config
        return DEFAULT_CONFIG

    def save_preferences(self, user_id: int, config: dict) -> dict:
        pref = self.db.query(UserPreferences).filter(
            UserPreferences.user_id == user_id
        ).first()
        if pref:
            pref.dashboard_config = config
        else:
            pref = UserPreferences(user_id=user_id, dashboard_config=config)
            self.db.add(pref)
        self.db.commit()
        self.db.refresh(pref)
        return pref.dashboard_config
