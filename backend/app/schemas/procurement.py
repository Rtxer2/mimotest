from datetime import datetime
from pydantic import BaseModel


class SupplierBase(BaseModel):
    code: str = ""
    name: str
    contact_person: str = ""
    phone: str = ""
    email: str = ""
    address: str = ""
    status: str = "active"


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    code: str | None = None
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


class DepartmentBase(BaseModel):
    code: str = ""
    name: str


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentResponse(DepartmentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class WarehouseBase(BaseModel):
    code: str = ""
    name: str
    location: str = ""


class WarehouseCreate(WarehouseBase):
    pass


class WarehouseResponse(WarehouseBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PurchaseRequestItemBase(BaseModel):
    item_type: str = "material"
    material_id: int | None = None
    product_id: int | None = None
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
    item_type: str = "material"
    material_id: int | None = None
    product_id: int | None = None
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
    pass_quantity: float
    reject_quantity: float
    notes: str = ""


class PurchaseReturnItemCreate(BaseModel):
    order_item_id: int
    quantity: float
    reason: str = ""


class PurchaseReturnItemResponse(BaseModel):
    id: int
    return_id: int
    order_item_id: int
    quantity: float
    reason: str

    class Config:
        from_attributes = True


class PurchaseReturnCreate(BaseModel):
    order_id: int
    supplier_id: int
    reason: str = ""
    items: list[PurchaseReturnItemCreate] = []


class PurchaseReturnResponse(BaseModel):
    id: int
    return_no: str
    order_id: int
    supplier_id: int
    status: str
    reason: str
    created_at: datetime

    class Config:
        from_attributes = True


class PurchaseReturnDetailResponse(PurchaseReturnResponse):
    items: list[PurchaseReturnItemResponse] = []
