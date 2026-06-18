from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session

from app.models.inventory import Category, Material, FinishedProduct, StockTransaction
from app.services.notification_service import NotificationService

from app.schemas.inventory import (
    CategoryCreate,
    MaterialCreate, MaterialUpdate,
    FinishedProductCreate, FinishedProductUpdate,
    StockTransactionCreate
)


class InventoryService:
    def __init__(self, db: Session):
        self.db = db

    def list_materials(self, skip: int = 0, limit: int = 100):
        return self.db.query(Material).offset(skip).limit(limit).all()

    def get_material(self, material_id: int):
        return self.db.query(Material).filter(Material.id == material_id).first()

    def create_material(self, data: MaterialCreate):
        material = Material(**data.model_dump())
        self.db.add(material)
        self.db.commit()
        self.db.refresh(material)
        return material

    def update_material(self, material_id: int, data: MaterialUpdate):
        material = self.get_material(material_id)
        if not material:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(material, key, value)
        self.db.commit()
        self.db.refresh(material)
        return material

    def list_categories(self):
        return self.db.query(Category).order_by(Category.name).all()

    def create_category(self, data: CategoryCreate):
        existing = self.db.query(Category).filter(Category.name == data.name).first()
        if existing:
            raise ValueError(f"Category '{data.name}' already exists")
        cat = Category(name=data.name)
        self.db.add(cat)
        self.db.commit()
        self.db.refresh(cat)
        return cat

    def delete_category(self, category_id: int):
        cat = self.db.query(Category).filter(Category.id == category_id).first()
        if not cat:
            return False
        self.db.delete(cat)
        self.db.commit()
        return True

    def list_products(self, skip: int = 0, limit: int = 100, category: str | None = None):
        query = self.db.query(FinishedProduct)
        if category:
            query = query.filter(FinishedProduct.category == category)
        return query.offset(skip).limit(limit).all()

    def get_product(self, product_id: int):
        return self.db.query(FinishedProduct).filter(FinishedProduct.id == product_id).first()

    def create_product(self, data: FinishedProductCreate):
        product = FinishedProduct(**data.model_dump())
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def update_product(self, product_id: int, data: FinishedProductUpdate):
        product = self.get_product(product_id)
        if not product:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(product, key, value)
        self.db.commit()
        self.db.refresh(product)
        return product

    def delete_product(self, product_id: int):
        product = self.get_product(product_id)
        if not product:
            return False
        self.db.delete(product)
        self.db.commit()
        return True

    def create_transaction(self, data: StockTransactionCreate):
        transaction = StockTransaction(**data.model_dump(), transaction_date=datetime.utcnow())
        self.db.add(transaction)

        if data.item_type == "material":
            material = self.get_material(data.item_id)
            if not material:
                raise ValueError(f"Material {data.item_id} not found")
            if data.transaction_type == "in":
                material.current_stock += data.quantity
            else:
                if material.current_stock < data.quantity:
                    raise ValueError(f"Insufficient stock for material {data.item_id}")
                material.current_stock -= data.quantity
        elif data.item_type == "product":
            product = self.get_product(data.item_id)
            if not product:
                raise ValueError(f"Product {data.item_id} not found")
            if data.transaction_type == "in":
                product.current_stock += int(data.quantity)
            else:
                if product.current_stock < int(data.quantity):
                    raise ValueError(f"Insufficient stock for product {data.item_id}")
                product.current_stock -= int(data.quantity)
        else:
            raise ValueError(f"Invalid item_type: {data.item_type}")

        self.db.commit()
        self.db.refresh(transaction)

        if data.item_type == "material":
            material = self.get_material(data.item_id)
            if material and material.current_stock < material.safety_stock:
                notification_service = NotificationService(self.db)
                notification_service.create_notification(
                    event_type="inventory_low",
                    title=f"库存预警: {material.name}",
                    content=f"原材料 {material.name} 当前库存 {material.current_stock} 低于安全库存 {material.safety_stock}",
                    link="/inventory/materials",
                    notification_type="inventory"
                )

        return transaction

    def list_transactions(self, item_type: str | None = None, item_id: int | None = None, skip: int = 0, limit: int = 100):
        query = self.db.query(StockTransaction)
        if item_type:
            query = query.filter(StockTransaction.item_type == item_type)
        if item_id:
            query = query.filter(StockTransaction.item_id == item_id)
        return query.order_by(StockTransaction.transaction_date.desc()).offset(skip).limit(limit).all()
