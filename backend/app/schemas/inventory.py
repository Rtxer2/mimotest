from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class MaterialBase(BaseModel):
    name: str
    code: str
    unit: str
    safety_stock: Decimal = 0


class MaterialCreate(MaterialBase):
    pass


class MaterialUpdate(BaseModel):
    name: str | None = None
    unit: str | None = None
    safety_stock: Decimal | None = None


class MaterialResponse(MaterialBase):
    id: int
    current_stock: Decimal

    class Config:
        from_attributes = True


class FinishedProductBase(BaseModel):
    product_name: str
    sku: str
    safety_stock: int = 0


class FinishedProductCreate(FinishedProductBase):
    pass


class FinishedProductUpdate(BaseModel):
    product_name: str | None = None
    safety_stock: int | None = None


class FinishedProductResponse(FinishedProductBase):
    id: int
    current_stock: int

    class Config:
        from_attributes = True


class StockTransactionBase(BaseModel):
    item_type: str
    item_id: int
    transaction_type: str
    quantity: Decimal
    reason: str | None = None


class StockTransactionCreate(StockTransactionBase):
    pass


class StockTransactionResponse(StockTransactionBase):
    id: int
    transaction_date: datetime

    class Config:
        from_attributes = True
