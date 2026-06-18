import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User


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


if __name__ == "__main__":
    seed()
