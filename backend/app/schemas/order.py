from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class OrderItemBase(BaseModel):
    product_name: str
    quantity: int
    unit_price: Decimal | None = None
    specs: str | None = None


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    customer_id: int
    delivery_date: datetime | None = None
    remarks: str | None = None


class OrderCreate(OrderBase):
    items: list[OrderItemCreate]


class OrderUpdate(BaseModel):
    delivery_date: datetime | None = None
    remarks: str | None = None
    status: str | None = None


class OrderResponse(OrderBase):
    id: int
    order_no: str
    status: str
    total_amount: Decimal | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderDetailResponse(OrderResponse):
    items: list[OrderItemResponse] = []
