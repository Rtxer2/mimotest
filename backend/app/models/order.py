from sqlalchemy import Column, String, Integer, ForeignKey, Numeric, DateTime, Text
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Order(BaseModel):
    __tablename__ = "orders"

    order_no = Column(String(50), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    status = Column(String(20), default="pending")
    total_amount = Column(Numeric(12, 2))
    delivery_date = Column(DateTime)
    remarks = Column(Text)

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    production_order = relationship("ProductionOrder", back_populates="order", uselist=False)


class OrderItem(BaseModel):
    __tablename__ = "order_items"

    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_name = Column(String(200), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2))
    specs = Column(Text)

    order = relationship("Order", back_populates="items")
