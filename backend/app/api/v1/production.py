from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_any_role, require_operator_or_above, require_manager_or_above
from app.models.user import User
from app.schemas.production import (
    ProductionOrderCreate, ProductionOrderUpdate,
    ProductionOrderResponse, ProductionOrderDetailResponse, ProductionDashboard
)
from app.services.production_service import ProductionService

router = APIRouter()


@router.get("/dashboard", response_model=ProductionDashboard)
def get_dashboard(db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = ProductionService(db)
    return service.get_dashboard()


@router.get("/orders", response_model=list[ProductionOrderResponse])
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: str | None = None,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_any_role)
):
    service = ProductionService(db)
    return service.list_orders(skip=skip, limit=limit, status=status)


@router.get("/orders/{order_id}", response_model=ProductionOrderDetailResponse)
def get_order(order_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = ProductionService(db)
    order = service.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Production order not found")
    return order


@router.post("/orders", response_model=ProductionOrderResponse)
def create_order(data: ProductionOrderCreate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProductionService(db)
    return service.create_order(data)


@router.put("/orders/{order_id}", response_model=ProductionOrderResponse)
def update_order(order_id: int, data: ProductionOrderUpdate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProductionService(db)
    order = service.update_order(order_id, data)
    if not order:
        raise HTTPException(status_code=404, detail="Production order not found")
    return order


@router.put("/orders/{order_id}/stages/{stage_id}")
def update_stage(order_id: int, stage_id: int, status: str, progress: float | None = None, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProductionService(db)
    try:
        stage = service.update_stage(order_id, stage_id, status, progress)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    return stage
