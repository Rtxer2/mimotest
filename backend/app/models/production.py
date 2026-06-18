from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class ProductionOrder(BaseModel):
    __tablename__ = "production_orders"

    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    status = Column(String(20), default="pending")
    assigned_workshop = Column(String(100))
    planned_start = Column(DateTime)
    planned_end = Column(DateTime)
    remarks = Column(Text)

    order = relationship("Order", back_populates="production_order")
    stages = relationship("ProductionStage", back_populates="production_order", cascade="all, delete-orphan")


class ProductionStage(BaseModel):
    __tablename__ = "production_stages"

    production_order_id = Column(Integer, ForeignKey("production_orders.id"), nullable=False)
    stage_name = Column(String(100), nullable=False)
    status = Column(String(20), default="pending")
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    progress = Column(Float, default=0)
    remarks = Column(Text)

    production_order = relationship("ProductionOrder", back_populates="stages")
