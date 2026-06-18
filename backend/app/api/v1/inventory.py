from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.schemas.inventory import (
    MaterialCreate, MaterialUpdate, MaterialResponse,
    FinishedProductCreate, FinishedProductUpdate, FinishedProductResponse,
    StockTransactionCreate, StockTransactionResponse
)
from app.services.inventory_service import InventoryService

router = APIRouter()


@router.get("/materials", response_model=list[MaterialResponse])
def list_materials(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    return service.list_materials(skip=skip, limit=limit)


@router.get("/materials/{material_id}", response_model=MaterialResponse)
def get_material(material_id: int, db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    material = service.get_material(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material


@router.post("/materials", response_model=MaterialResponse)
def create_material(data: MaterialCreate, db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    return service.create_material(data)


@router.put("/materials/{material_id}", response_model=MaterialResponse)
def update_material(material_id: int, data: MaterialUpdate, db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    material = service.update_material(material_id, data)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material


@router.get("/products", response_model=list[FinishedProductResponse])
def list_products(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    return service.list_products(skip=skip, limit=limit)


@router.get("/products/{product_id}", response_model=FinishedProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    product = service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/products", response_model=FinishedProductResponse)
def create_product(data: FinishedProductCreate, db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    return service.create_product(data)


@router.put("/products/{product_id}", response_model=FinishedProductResponse)
def update_product(product_id: int, data: FinishedProductUpdate, db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    product = service.update_product(product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/transactions", response_model=StockTransactionResponse)
def create_transaction(data: StockTransactionCreate, db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    return service.create_transaction(data)


@router.get("/transactions", response_model=list[StockTransactionResponse])
def list_transactions(
    item_type: str | None = None,
    item_id: int | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db_session)
):
    service = InventoryService(db)
    return service.list_transactions(item_type=item_type, item_id=item_id, skip=skip, limit=limit)
