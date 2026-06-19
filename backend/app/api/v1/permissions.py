from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, get_current_active_user, require_admin
from app.models.user import User

router = APIRouter()

ROLE_PERMISSIONS = {
    "admin": {
        "dashboard": True,
        "analytics": True,
        "customers": True,
        "customers.analytics": True,
        "orders": True,
        "orders.create": True,
        "orders.edit": True,
        "orders.delete": True,
        "production": True,
        "inventory": True,
        "inventory.alerts": True,
        "quality": True,
        "approvals": True,
        "approvals.flows": True,
        "procurement": True,
        "notifications": True,
        "system.users": True,
        "system.dict": True,
        "system.dashboard_config": True,
        "system.reports": True,
        "system.permissions": True,
    },
    "manager": {
        "dashboard": True,
        "analytics": True,
        "customers": True,
        "customers.analytics": True,
        "orders": True,
        "orders.create": True,
        "orders.edit": True,
        "orders.delete": False,
        "production": True,
        "inventory": True,
        "inventory.alerts": True,
        "quality": True,
        "approvals": True,
        "approvals.flows": False,
        "procurement": True,
        "notifications": True,
        "system.users": False,
        "system.dict": True,
        "system.dashboard_config": True,
        "system.reports": True,
        "system.permissions": False,
    },
    "operator": {
        "dashboard": True,
        "analytics": True,
        "customers": True,
        "customers.analytics": False,
        "orders": True,
        "orders.create": True,
        "orders.edit": True,
        "orders.delete": False,
        "production": True,
        "inventory": True,
        "inventory.alerts": True,
        "quality": True,
        "approvals": True,
        "approvals.flows": False,
        "procurement": True,
        "notifications": True,
        "system.users": False,
        "system.dict": False,
        "system.dashboard_config": False,
        "system.reports": True,
        "system.permissions": False,
    },
    "viewer": {
        "dashboard": True,
        "analytics": True,
        "customers": True,
        "customers.analytics": False,
        "orders": True,
        "orders.create": False,
        "orders.edit": False,
        "orders.delete": False,
        "production": True,
        "inventory": True,
        "inventory.alerts": True,
        "quality": True,
        "approvals": True,
        "approvals.flows": False,
        "procurement": False,
        "notifications": True,
        "system.users": False,
        "system.dict": False,
        "system.dashboard_config": False,
        "system.reports": False,
        "system.permissions": False,
    },
}


@router.get("")
def get_permissions(
    current_user: User = Depends(get_current_active_user),
):
    role = current_user.role
    return {
        "role": role,
        "permissions": ROLE_PERMISSIONS.get(role, ROLE_PERMISSIONS["viewer"]),
    }


@router.get("/all")
def get_all_permissions(
    current_user: User = Depends(require_admin),
):
    return ROLE_PERMISSIONS
