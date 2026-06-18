from fastapi import APIRouter

from app.api.v1 import customers, orders, production, inventory, quality

api_router = APIRouter()

api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(production.router, prefix="/production", tags=["production"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(quality.router, prefix="/quality", tags=["quality"])
