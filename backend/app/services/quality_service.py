from sqlalchemy.orm import Session

from app.models.quality import QualityInspection, QualityIssue
from app.schemas.quality import QualityInspectionCreate


class QualityService:
    def __init__(self, db: Session):
        self.db = db

    def list_inspections(self, skip: int = 0, limit: int = 100, inspection_type: str | None = None):
        query = self.db.query(QualityInspection)
        if inspection_type:
            query = query.filter(QualityInspection.inspection_type == inspection_type)
        return query.order_by(QualityInspection.created_at.desc()).offset(skip).limit(limit).all()

    def get_inspection(self, inspection_id: int):
        return self.db.query(QualityInspection).filter(QualityInspection.id == inspection_id).first()

    def create_inspection(self, data: QualityInspectionCreate):
        inspection = QualityInspection(
            inspection_type=data.inspection_type,
            item_id=data.item_id,
            result=data.result,
            inspector=data.inspector,
            inspect_time=data.inspect_time,
            remarks=data.remarks,
        )
        self.db.add(inspection)
        self.db.flush()

        for issue_data in data.issues:
            issue = QualityIssue(inspection_id=inspection.id, **issue_data.model_dump())
            self.db.add(issue)

        self.db.commit()
        self.db.refresh(inspection)
        return inspection

    def list_issues(self, skip: int = 0, limit: int = 100, status: str | None = None):
        query = self.db.query(QualityIssue)
        if status:
            query = query.filter(QualityIssue.status == status)
        return query.offset(skip).limit(limit).all()

    def update_issue(self, issue_id: int, status: str):
        issue = self.db.query(QualityIssue).filter(QualityIssue.id == issue_id).first()
        if not issue:
            return None
        issue.status = status
        self.db.commit()
        self.db.refresh(issue)
        return issue
