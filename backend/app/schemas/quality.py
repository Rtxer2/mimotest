from datetime import datetime
from pydantic import BaseModel


class QualityIssueBase(BaseModel):
    issue_type: str
    description: str | None = None
    status: str = "open"


class QualityIssueCreate(QualityIssueBase):
    pass


class QualityIssueResponse(QualityIssueBase):
    id: int
    inspection_id: int

    class Config:
        from_attributes = True


class QualityInspectionBase(BaseModel):
    inspection_type: str
    item_id: int
    result: str
    inspector: str | None = None
    inspect_time: datetime | None = None
    remarks: str | None = None


class QualityInspectionCreate(QualityInspectionBase):
    issues: list[QualityIssueCreate] = []


class QualityInspectionResponse(QualityInspectionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class QualityInspectionDetailResponse(QualityInspectionResponse):
    issues: list[QualityIssueResponse] = []
