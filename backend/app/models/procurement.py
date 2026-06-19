from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Supplier(BaseModel):
    __tablename__ = "suppliers"

    name = Column(String(200), nullable=False)
    contact_person = Column(String(100), default="")
    phone = Column(String(50), default="")
    email = Column(String(100), default="")
    address = Column(Text, default="")
    status = Column(String(20), default="active")


class PurchaseRequest(BaseModel):
    __tablename__ = "purchase_requests"

    request_no = Column(String(50), unique=True, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    status = Column(String(30), default="draft")
    total_amount = Column(Numeric(12, 2), default=0)
    remarks = Column(Text, default="")
    initiator_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    supplier = relationship("Supplier")
    items = relationship("PurchaseRequestItem", back_populates="request", cascade="all, delete-orphan")


class PurchaseRequestItem(BaseModel):
    __tablename__ = "purchase_request_items"

    request_id = Column(Integer, ForeignKey("purchase_requests.id"), nullable=False)
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    unit_price = Column(Numeric(10, 2), default=0)

    request = relationship("PurchaseRequest", back_populates="items")
    material = relationship("Material")


class PurchaseOrder(BaseModel):
    __tablename__ = "purchase_orders"

    order_no = Column(String(50), unique=True, nullable=False)
    request_id = Column(Integer, ForeignKey("purchase_requests.id"), nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    status = Column(String(20), default="pending")
    total_amount = Column(Numeric(12, 2), default=0)
    delivery_date = Column(String(20), default="")
    remarks = Column(Text, default="")

    supplier = relationship("Supplier")
    items = relationship("PurchaseOrderItem", back_populates="order", cascade="all, delete-orphan")


class PurchaseOrderItem(BaseModel):
    __tablename__ = "purchase_order_items"

    order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    unit_price = Column(Numeric(10, 2), default=0)
    received_quantity = Column(Numeric(10, 2), default=0)

    order = relationship("PurchaseOrder", back_populates="items")
    material = relationship("Material")
