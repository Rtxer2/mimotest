from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_any_role, require_operator_or_above
from app.models.user import User
from app.schemas.procurement import (
    SupplierCreate, SupplierUpdate, SupplierResponse,
    DepartmentCreate, DepartmentResponse,
    WarehouseCreate, WarehouseResponse,
    PurchaseRequestCreate, PurchaseRequestResponse, PurchaseRequestDetailResponse,
    PurchaseOrderCreate, PurchaseOrderResponse, PurchaseOrderDetailResponse,
    ReceiveItem,
    PurchaseReturnCreate, PurchaseReturnResponse, PurchaseReturnDetailResponse,
)
from app.services.procurement_service import ProcurementService

router = APIRouter()


# === Suppliers ===

@router.get("/suppliers/search", response_model=list[SupplierResponse])
def search_suppliers(q: str = Query("", min_length=0), db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = ProcurementService(db)
    return service.search_suppliers(q) if q else []


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


# === Departments ===

@router.get("/departments/search", response_model=list[DepartmentResponse])
def search_departments(q: str = Query("", min_length=0), db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = ProcurementService(db)
    return service.search_departments(q) if q else []


@router.get("/departments", response_model=list[DepartmentResponse])
def list_departments(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = ProcurementService(db)
    return service.list_departments(skip=skip, limit=limit)


@router.post("/departments", response_model=DepartmentResponse)
def create_department(data: DepartmentCreate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    return service.create_department(data)


@router.delete("/departments/{id}")
def delete_department(id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    if not service.delete_department(id):
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}


# === Warehouses ===

@router.get("/warehouses/search", response_model=list[WarehouseResponse])
def search_warehouses(q: str = Query("", min_length=0), db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = ProcurementService(db)
    return service.search_warehouses(q) if q else []


@router.get("/warehouses", response_model=list[WarehouseResponse])
def list_warehouses(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = ProcurementService(db)
    return service.list_warehouses(skip=skip, limit=limit)


@router.post("/warehouses", response_model=WarehouseResponse)
def create_warehouse(data: WarehouseCreate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    return service.create_warehouse(data)


@router.delete("/warehouses/{id}")
def delete_warehouse(id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    if not service.delete_warehouse(id):
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Deleted"}


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


@router.put("/orders/{order_id}", response_model=PurchaseOrderResponse)
def update_order(order_id: int, data: PurchaseOrderCreate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    order, error = service.update_order(order_id, data)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return order


@router.post("/orders/{order_id}/complete", response_model=PurchaseOrderResponse)
def complete_order(order_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    order, error = service.complete_order(order_id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return order


@router.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    if not service.delete_order(order_id):
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return {"message": "Purchase order deleted"}


# === Purchase Returns ===

@router.get("/returns", response_model=list[PurchaseReturnResponse])
def list_returns(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), order_id: int | None = None, db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = ProcurementService(db)
    return service.list_returns(skip=skip, limit=limit, order_id=order_id)


@router.get("/returns/{return_id}", response_model=PurchaseReturnDetailResponse)
def get_return(return_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = ProcurementService(db)
    ret = service.get_return_detail(return_id)
    if not ret:
        raise HTTPException(status_code=404, detail="Purchase return not found")
    return ret


@router.post("/returns", response_model=PurchaseReturnResponse)
def create_return(data: PurchaseReturnCreate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    return service.create_return(data, user_id=current_user.id)


@router.post("/returns/{return_id}/complete", response_model=PurchaseReturnResponse)
def complete_return(return_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = ProcurementService(db)
    ret = service.complete_return(return_id)
    if not ret:
        raise HTTPException(status_code=404, detail="Purchase return not found")
    return ret
