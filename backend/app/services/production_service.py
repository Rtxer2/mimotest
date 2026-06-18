from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.production import ProductionOrder, ProductionStage
from app.models.order import Order
from app.schemas.production import ProductionOrderCreate, ProductionOrderUpdate


class ProductionService:
    def __init__(self, db: Session):
        self.db = db

    def list_orders(self, skip: int = 0, limit: int = 100, status: str | None = None):
        query = self.db.query(ProductionOrder)
        if status:
            query = query.filter(ProductionOrder.status == status)
        return query.offset(skip).limit(limit).all()

    def get_order(self, order_id: int):
        return self.db.query(ProductionOrder).filter(ProductionOrder.id == order_id).first()

    def create_order(self, data: ProductionOrderCreate):
        prod_order = ProductionOrder(
            order_id=data.order_id,
            assigned_workshop=data.assigned_workshop,
            planned_start=data.planned_start,
            planned_end=data.planned_end,
            remarks=data.remarks,
        )
        self.db.add(prod_order)
        self.db.flush()

        for stage_data in data.stages:
            stage = ProductionStage(production_order_id=prod_order.id, **stage_data.model_dump())
            self.db.add(stage)

        self.db.commit()
        self.db.refresh(prod_order)
        return prod_order

    def update_order(self, order_id: int, data: ProductionOrderUpdate):
        order = self.get_order(order_id)
        if not order:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(order, key, value)
        self.db.commit()
        self.db.refresh(order)
        return order

    def update_stage(self, stage_id: int, status: str, progress: float | None = None):
        stage = self.db.query(ProductionStage).filter(ProductionStage.id == stage_id).first()
        if not stage:
            return None
        stage.status = status
        if progress is not None:
            stage.progress = progress
        if status == "in_progress" and not stage.start_time:
            stage.start_time = datetime.utcnow()
        elif status == "completed":
            stage.end_time = datetime.utcnow()
            stage.progress = 100
        self.db.commit()
        self.db.refresh(stage)
        return stage

    def get_dashboard(self):
        total = self.db.query(func.count(ProductionOrder.id)).scalar()
        in_progress = self.db.query(func.count(ProductionOrder.id)).filter(
            ProductionOrder.status == "in_progress"
        ).scalar()
        completed = self.db.query(func.count(ProductionOrder.id)).filter(
            ProductionOrder.status == "completed"
        ).scalar()
        delayed = self.db.query(func.count(ProductionOrder.id)).filter(
            ProductionOrder.planned_end < datetime.utcnow(),
            ProductionOrder.status != "completed"
        ).scalar()

        return {
            "total_orders": total,
            "in_progress": in_progress,
            "completed": completed,
            "delayed": delayed,
        }
