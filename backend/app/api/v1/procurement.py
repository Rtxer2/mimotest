from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_any_role, require_operator_or_above
from app.models.user import User
from app.schemas.procurement import (
    SupplierCreate, SupplierUpdate, SupplierResponse,
    PurchaseRequestCreate, PurchaseRequestResponse, PurchaseRequestDetailResponse,
    PurchaseOrderCreate, PurchaseOrderResponse, PurchaseOrderDetailResponse,
    ReceiveItem,
)
from app.services.procurement_service import ProcurementService

router = APIRouter()


# === Suppliers ===

@router.get("/suppliers", response_model=list[SupplierResponse])
def list_suppliers(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = ProcurementService(db)
    return service.list_suppliers(skip=skip, limit=limit)


@router.get("/suppliers/{supplier_id}", response_model=SupplierResponse)
def get_supplier(supplier_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = ProcurementService(db)
    supplier = service.get_supplier(supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


@router.post("/suppliers", response_model=SupplierResponse)
def create_supplier(data: SupplierCreate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    return service.create_supplier(data)


@router.put("/suppliers/{supplier_id}", response_model=SupplierResponse)
def update_supplier(supplier_id: int, data: SupplierUpdate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    supplier = service.update_supplier(supplier_id, data)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


@router.delete("/suppliers/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    if not service.delete_supplier(supplier_id):
        raise HTTPException(status_code=404, detail="Supplier not found")
    return {"message": "Supplier deleted"}


# === Purchase Requests ===

@router.get("/requests", response_model=list[PurchaseRequestResponse])
def list_requests(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), status: str | None = None, db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = ProcurementService(db)
    return service.list_requests(skip=skip, limit=limit, status=status)


@router.get("/requests/{request_id}", response_model=PurchaseRequestDetailResponse)
def get_request(request_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = ProcurementService(db)
    req = service.get_request_detail(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Purchase request not found")
    return req


@router.post("/requests", response_model=PurchaseRequestResponse)
def create_request(data: PurchaseRequestCreate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    return service.create_request(data, user_id=current_user.id)


@router.post("/requests/{request_id}/submit")
def submit_request(request_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    req, error = service.submit_request(request_id, user_id=current_user.id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return req


@router.delete("/requests/{request_id}")
def delete_request(request_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    if not service.delete_request(request_id):
        raise HTTPException(status_code=404, detail="Purchase request not found")
    return {"message": "Purchase request deleted"}


# === Purchase Orders ===

@router.get("/orders", response_model=list[PurchaseOrderResponse])
def list_orders(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), status: str | None = None, db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = ProcurementService(db)
    return service.list_orders(skip=skip, limit=limit, status=status)


@router.get("/orders/{order_id}", response_model=PurchaseOrderDetailResponse)
def get_order(order_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = ProcurementService(db)
    order = service.get_order_detail(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return order


@router.post("/orders", response_model=PurchaseOrderResponse)
def create_order(data: PurchaseOrderCreate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    return service.create_order(data)


@router.post("/orders/{order_id}/receive", response_model=PurchaseOrderResponse)
def receive_items(order_id: int, items: list[ReceiveItem], db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    order, error = service.receive_items(order_id, items)
    if error:
        raise HTTPException(status_code=404, detail=error)
    return order


@router.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    if not service.delete_order(order_id):
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return {"message": "Purchase order deleted"}
