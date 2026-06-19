from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_any_role, require_operator_or_above, require_manager_or_above
from app.models.user import User
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse, OrderDetailResponse
from app.services.order_service import OrderService

router = APIRouter()


@router.get("", response_model=list[OrderResponse])
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    customer_id: int | None = None,
    status: str | None = None,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_any_role)
):
    service = OrderService(db)
    return service.list_orders(skip=skip, limit=limit, customer_id=customer_id, status=status)


@router.get("/{order_id}", response_model=OrderDetailResponse)
def get_order(order_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = OrderService(db)
    order = service.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("", response_model=OrderResponse)
def create_order(data: OrderCreate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = OrderService(db)
    try:
        return service.create_order(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{order_id}", response_model=OrderResponse)
def update_order(order_id: int, data: OrderUpdate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = OrderService(db)
    order = service.update_order(order_id, data)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/{order_id}/submit-approval", response_model=OrderResponse)
def submit_for_approval(order_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = OrderService(db)
    order, error = service.submit_for_approval(order_id, current_user.id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return order


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_status(order_id: int, status: str, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = OrderService(db)
    try:
        order = service.update_status(order_id, status)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = OrderService(db)
    if not service.delete_order(order_id):
        raise HTTPException(status_code=400, detail="Cannot delete this order")
    return {"message": "Order deleted"}
