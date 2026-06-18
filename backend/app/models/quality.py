from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class QualityInspection(BaseModel):
    __tablename__ = "quality_inspections"

    inspection_type = Column(String(50), nullable=False)
    item_id = Column(Integer, nullable=False)
    result = Column(String(20), nullable=False)
    inspector = Column(String(100))
    inspect_time = Column(DateTime)
    remarks = Column(Text)

    issues = relationship("QualityIssue", back_populates="inspection", cascade="all, delete-orphan")


class QualityIssue(BaseModel):
    __tablename__ = "quality_issues"

    inspection_id = Column(Integer, ForeignKey("quality_inspections.id"), nullable=False)
    issue_type = Column(String(50), nullable=False)
    description = Column(Text)
    status = Column(String(20), default="open")

    inspection = relationship("QualityInspection", back_populates="issues")
