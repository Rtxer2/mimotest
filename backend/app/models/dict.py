from sqlalchemy import Column, String, Integer, Text, Boolean
from app.models.base import BaseModel


class DictType(BaseModel):
    __tablename__ = "dict_types"

    name = Column(String(100), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(Text, default="")
    status = Column(String(20), default="active")


class DictEntry(BaseModel):
    __tablename__ = "dict_entries"

    dict_type_code = Column(String(50), nullable=False, index=True)
    label = Column(String(100), nullable=False)
    value = Column(String(100), nullable=False)
    sort_order = Column(Integer, default=0)
    status = Column(String(20), default="active")
    remark = Column(Text, default="")
