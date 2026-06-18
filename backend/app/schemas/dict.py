from pydantic import BaseModel


class DictTypeCreate(BaseModel):
    name: str
    code: str
    description: str = ""
    status: str = "active"


class DictTypeUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: str | None = None


class DictTypeResponse(BaseModel):
    id: int
    name: str
    code: str
    description: str
    status: str

    class Config:
        from_attributes = True


class DictEntryCreate(BaseModel):
    dict_type_code: str
    label: str
    value: str
    sort_order: int = 0
    status: str = "active"
    remark: str = ""


class DictEntryUpdate(BaseModel):
    label: str | None = None
    value: str | None = None
    sort_order: int | None = None
    status: str | None = None
    remark: str | None = None


class DictEntryResponse(BaseModel):
    id: int
    dict_type_code: str
    label: str
    value: str
    sort_order: int
    status: str
    remark: str

    class Config:
        from_attributes = True
