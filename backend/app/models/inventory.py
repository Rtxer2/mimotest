from sqlalchemy import Column, String, Integer, Numeric, DateTime, Text
from app.models.base import BaseModel


class Material(BaseModel):
    __tablename__ = "materials"

    name = Column(String(200), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    unit = Column(String(20), nullable=False)
    safety_stock = Column(Numeric(10, 2), default=0)
    current_stock = Column(Numeric(10, 2), default=0)


class FinishedProduct(BaseModel):
    __tablename__ = "finished_products"

    product_name = Column(String(200), nullable=False)
    sku = Column(String(50), unique=True, nullable=False)
    current_stock = Column(Integer, default=0)
    safety_stock = Column(Integer, default=0)


class StockTransaction(BaseModel):
    __tablename__ = "stock_transactions"

    item_type = Column(String(20), nullable=False)
    item_id = Column(Integer, nullable=False)
    transaction_type = Column(String(20), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    reason = Column(Text)
    transaction_date = Column(DateTime)
