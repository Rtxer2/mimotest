from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.customer import Customer


async def get_current_active_user(current_user: Customer = Depends(get_current_user)):
    if current_user.status != "active":
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_db_session(db: Session = Depends(get_db)):
    return db
