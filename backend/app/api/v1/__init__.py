from fastapi import APIRouter

from app.api.v1 import auth, customers, orders, production, inventory, quality, dict, users, notifications, approvals, analytics, preferences, reports, procurement

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(production.router, prefix="/production", tags=["production"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(quality.router, prefix="/quality", tags=["quality"])
api_router.include_router(dict.router, prefix="/dict", tags=["dict"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(approvals.router, prefix="/approvals", tags=["approvals"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(preferences.router, prefix="/preferences", tags=["preferences"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(procurement.router, prefix="/procurement", tags=["procurement"])
