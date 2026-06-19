from datetime import datetime
from pydantic import BaseModel


class SupplierBase(BaseModel):
    name: str
    contact_person: str = ""
    phone: str = ""
    email: str = ""
    address: str = ""
    status: str = "active"


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: str | None = None
    contact_person: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    status: str | None = None


class SupplierResponse(SupplierBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PurchaseRequestItemBase(BaseModel):
    material_id: int
    quantity: float
    unit_price: float = 0


class PurchaseRequestItemCreate(PurchaseRequestItemBase):
    pass


class PurchaseRequestItemResponse(PurchaseRequestItemBase):
    id: int
    request_id: int

    class Config:
        from_attributes = True


class PurchaseRequestCreate(BaseModel):
    supplier_id: int
    remarks: str = ""
    items: list[PurchaseRequestItemCreate] = []


class PurchaseRequestResponse(BaseModel):
    id: int
    request_no: str
    supplier_id: int
    status: str
    total_amount: float
    remarks: str
    initiator_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PurchaseRequestDetailResponse(PurchaseRequestResponse):
    items: list[PurchaseRequestItemResponse] = []


class PurchaseOrderItemBase(BaseModel):
    material_id: int
    quantity: float
    unit_price: float = 0


class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass


class PurchaseOrderItemResponse(PurchaseOrderItemBase):
    id: int
    order_id: int
    received_quantity: float

    class Config:
        from_attributes = True


class PurchaseOrderCreate(BaseModel):
    supplier_id: int
    request_id: int | None = None
    delivery_date: str = ""
    remarks: str = ""
    items: list[PurchaseOrderItemCreate] = []


class PurchaseOrderResponse(BaseModel):
    id: int
    order_no: str
    request_id: int | None
    supplier_id: int
    status: str
    total_amount: float
    delivery_date: str
    remarks: str
    created_at: datetime

    class Config:
        from_attributes = True


class PurchaseOrderDetailResponse(PurchaseOrderResponse):
    items: list[PurchaseOrderItemResponse] = []


class ReceiveItem(BaseModel):
    item_id: int
    quantity: float
