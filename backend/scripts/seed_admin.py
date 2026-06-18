import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.notification import NotificationRule


def seed():
    db = SessionLocal()
    existing = db.query(User).filter(User.role == "admin").first()
    if existing:
        print(f"Admin user already exists: {existing.email}")
        db.close()
        return
    admin = User(
        username="admin",
        email="admin@erp.local",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        is_active=True,
    )
    db.add(admin)
    db.commit()
    print("Admin user created: admin@erp.local / admin123")
    db.close()


def seed_notification_rules():
    db = SessionLocal()
    existing = db.query(NotificationRule).first()
    if existing:
        print("Notification rules already exist")
        db.close()
        return

    rules = [
        NotificationRule(event_type="order_created", role="manager", is_active=True),
        NotificationRule(event_type="order_status_changed", role="operator", is_active=True),
        NotificationRule(event_type="inventory_low", role="manager", is_active=True),
        NotificationRule(event_type="quality_issue_created", role="manager", is_active=True),
        NotificationRule(event_type="production_created", role="operator", is_active=True),
    ]
    for rule in rules:
        db.add(rule)
    db.commit()
    print("Default notification rules created")
    db.close()


if __name__ == "__main__":
    seed()
    seed_notification_rules()
