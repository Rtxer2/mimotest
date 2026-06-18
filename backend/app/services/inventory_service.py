from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session

from app.models.inventory import Material, FinishedProduct, StockTransaction
from app.schemas.inventory import (
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

    def list_products(self, skip: int = 0, limit: int = 100):
        return self.db.query(FinishedProduct).offset(skip).limit(limit).all()

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

    def create_transaction(self, data: StockTransactionCreate):
        transaction = StockTransaction(**data.model_dump(), transaction_date=datetime.utcnow())
        self.db.add(transaction)

        if data.item_type == "material":
            material = self.get_material(data.item_id)
            if material:
                if data.transaction_type == "in":
                    material.current_stock += data.quantity
                else:
                    material.current_stock -= data.quantity
        elif data.item_type == "product":
            product = self.get_product(data.item_id)
            if product:
                if data.transaction_type == "in":
                    product.current_stock += int(data.quantity)
                else:
                    product.current_stock -= int(data.quantity)

        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def list_transactions(self, item_type: str | None = None, item_id: int | None = None, skip: int = 0, limit: int = 100):
        query = self.db.query(StockTransaction)
        if item_type:
            query = query.filter(StockTransaction.item_type == item_type)
        if item_id:
            query = query.filter(StockTransaction.item_id == item_id)
        return query.order_by(StockTransaction.transaction_date.desc()).offset(skip).limit(limit).all()
