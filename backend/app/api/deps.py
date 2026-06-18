from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_db_session(db: Session = Depends(get_db)):
    return db


class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_active_user)):
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user


require_admin = RoleChecker(["admin"])
require_manager_or_above = RoleChecker(["admin", "manager"])
require_operator_or_above = RoleChecker(["admin", "manager", "operator"])
require_any_role = RoleChecker(["admin", "manager", "operator", "viewer"])
