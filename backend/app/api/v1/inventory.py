import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_any_role, require_operator_or_above, require_manager_or_above
from app.models.user import User
from app.schemas.inventory import (
    CategoryCreate, CategoryResponse,
    MaterialCreate, MaterialUpdate, MaterialResponse,
    FinishedProductCreate, FinishedProductUpdate, FinishedProductResponse,
    StockTransactionCreate, StockTransactionResponse
)
from app.services.inventory_service import InventoryService

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "..", "uploads", "products")


@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = InventoryService(db)
    return service.get_low_stock_alerts()


@router.get("/materials", response_model=list[MaterialResponse])
def list_materials(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = InventoryService(db)
    return service.list_materials(skip=skip, limit=limit)


@router.get("/materials/{material_id}", response_model=MaterialResponse)
def get_material(material_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = InventoryService(db)
    material = service.get_material(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material


@router.post("/materials", response_model=MaterialResponse)
def create_material(data: MaterialCreate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = InventoryService(db)
    return service.create_material(data)


@router.put("/materials/{material_id}", response_model=MaterialResponse)
def update_material(material_id: int, data: MaterialUpdate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = InventoryService(db)
    material = service.update_material(material_id, data)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material


@router.get("/products", response_model=list[FinishedProductResponse])
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category: str | None = None,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_any_role)
):
    service = InventoryService(db)
    return service.list_products(skip=skip, limit=limit, category=category)


@router.get("/products/categories", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = InventoryService(db)
    return service.list_categories()


@router.post("/products/categories", response_model=CategoryResponse)
def create_category(data: CategoryCreate, db: Session = Depends(get_db_session), current_user: User = Depends(require_manager_or_above)):
    service = InventoryService(db)
    try:
        return service.create_category(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/products/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_manager_or_above)):
    service = InventoryService(db)
    if not service.delete_category(category_id):
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}


@router.get("/products/{product_id}", response_model=FinishedProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_any_role)):
    service = InventoryService(db)
    product = service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/products", response_model=FinishedProductResponse)
def create_product(data: FinishedProductCreate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = InventoryService(db)
    return service.create_product(data)


@router.put("/products/{product_id}", response_model=FinishedProductResponse)
def update_product(product_id: int, data: FinishedProductUpdate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = InventoryService(db)
    product = service.update_product(product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db_session), current_user: User = Depends(require_manager_or_above)):
    service = InventoryService(db)
    if not service.delete_product(product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}


@router.post("/transactions", response_model=StockTransactionResponse)
def create_transaction(data: StockTransactionCreate, db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = InventoryService(db)
    try:
        return service.create_transaction(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/transactions", response_model=list[StockTransactionResponse])
def list_transactions(
    item_type: str | None = None,
    item_id: int | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_any_role)
):
    service = InventoryService(db)
    return service.list_transactions(item_type=item_type, item_id=item_id, skip=skip, limit=limit)


@router.post("/products/{product_id}/photos")
async def upload_product_photo(product_id: int, file: UploadFile = File(...), db: Session = Depends(get_db_session), current_user: User = Depends(require_operator_or_above)):
    service = InventoryService(db)
    product = service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filepath = os.path.join(UPLOAD_DIR, filename)

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    photo_url = f"/uploads/products/{filename}"
    existing = product.photos or ""
    product.photos = f"{existing},{photo_url}" if existing else photo_url
    db.commit()
    db.refresh(product)
    return {"photo_url": photo_url, "photos": product.photos}


@router.delete("/products/{product_id}/photos")
def remove_product_photo(product_id: int, photo_url: str, db: Session = Depends(get_db_session), current_user: User = Depends(require_manager_or_above)):
    service = InventoryService(db)
    product = service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    photos = [p for p in (product.photos or "").split(",") if p and p != photo_url]
    product.photos = ",".join(photos)
    db.commit()
    return {"photos": product.photos}
