from datetime import datetime
from pydantic import BaseModel


class ProductionStageBase(BaseModel):
    stage_name: str
    status: str = "pending"
    start_time: datetime | None = None
    end_time: datetime | None = None
    progress: float = 0
    remarks: str | None = None


class ProductionStageCreate(ProductionStageBase):
    pass


class ProductionStageResponse(ProductionStageBase):
    id: int
    production_order_id: int

    class Config:
        from_attributes = True


class ProductionOrderBase(BaseModel):
    order_id: int
    assigned_workshop: str | None = None
    planned_start: datetime | None = None
    planned_end: datetime | None = None
    remarks: str | None = None


class ProductionOrderCreate(ProductionOrderBase):
    stages: list[ProductionStageCreate]


class ProductionOrderUpdate(BaseModel):
    status: str | None = None
    assigned_workshop: str | None = None
    planned_start: datetime | None = None
    planned_end: datetime | None = None
    remarks: str | None = None


class ProductionOrderResponse(ProductionOrderBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProductionOrderDetailResponse(ProductionOrderResponse):
    stages: list[ProductionStageResponse] = []


class ProductionDashboard(BaseModel):
    total_orders: int
    in_progress: int
    completed: int
    delayed: int
