from datetime import datetime
from pydantic import BaseModel, EmailStr


class ContactBase(BaseModel):
    name: str
    position: str | None = None
    phone: str | None = None
    email: str | None = None
    is_primary: bool = False


class ContactCreate(ContactBase):
    pass


class ContactResponse(ContactBase):
    id: int
    customer_id: int

    class Config:
        from_attributes = True


class FollowUpBase(BaseModel):
    contact_id: int | None = None
    type: str
    content: str
    next_follow_date: datetime | None = None


class FollowUpCreate(FollowUpBase):
    pass


class FollowUpResponse(FollowUpBase):
    id: int
    customer_id: int

    class Config:
        from_attributes = True


class CustomerBase(BaseModel):
    name: str
    code: str
    level: str = "normal"
    source: str | None = None
    country: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: str | None = None
    level: str | None = None
    source: str | None = None
    country: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    status: str | None = None


class CustomerResponse(CustomerBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CustomerDetailResponse(CustomerResponse):
    contacts: list[ContactResponse] = []
    follow_ups: list[FollowUpResponse] = []
