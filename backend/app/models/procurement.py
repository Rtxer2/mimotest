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
    item_type = Column(String(20), default="material")  # material/product
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=True)
    product_id = Column(Integer, ForeignKey("finished_products.id"), nullable=True)
    quantity = Column(Numeric(10, 2), nullable=False)
    unit_price = Column(Numeric(10, 2), default=0)
    request = relationship("PurchaseRequest", back_populates="items")
    material = relationship("Material")
    product = relationship("FinishedProduct")


class PurchaseOrder(BaseModel):
    __tablename__ = "purchase_orders"
    order_no = Column(String(50), unique=True, nullable=False)
    request_id = Column(Integer, ForeignKey("purchase_requests.id"), nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    status = Column(String(20), default="pending")  # pending/ordered/inspecting/received/cancelled
    total_amount = Column(Numeric(12, 2), default=0)
    delivery_date = Column(String(20), default="")
    remarks = Column(Text, default="")
    supplier = relationship("Supplier")
    items = relationship("PurchaseOrderItem", back_populates="order", cascade="all, delete-orphan")


class PurchaseOrderItem(BaseModel):
    __tablename__ = "purchase_order_items"
    order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    item_type = Column(String(20), default="material")  # material/product
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=True)
    product_id = Column(Integer, ForeignKey("finished_products.id"), nullable=True)
    quantity = Column(Numeric(10, 2), nullable=False)
    unit_price = Column(Numeric(10, 2), default=0)
    received_quantity = Column(Numeric(10, 2), default=0)
    order = relationship("PurchaseOrder", back_populates="items")
    material = relationship("Material")
    product = relationship("FinishedProduct")


class PurchaseReturn(BaseModel):
    __tablename__ = "purchase_returns"
    return_no = Column(String(50), unique=True, nullable=False)
    order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    status = Column(String(20), default="pending")  # pending/completed
    reason = Column(Text, default="")
    order = relationship("PurchaseOrder")
    supplier = relationship("Supplier")
    items = relationship("PurchaseReturnItem", back_populates="return_record", cascade="all, delete-orphan")


class PurchaseReturnItem(BaseModel):
    __tablename__ = "purchase_return_items"
    return_id = Column(Integer, ForeignKey("purchase_returns.id"), nullable=False)
    order_item_id = Column(Integer, ForeignKey("purchase_order_items.id"), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    reason = Column(Text, default="")
    return_record = relationship("PurchaseReturn", back_populates="items")
    order_item = relationship("PurchaseOrderItem")
