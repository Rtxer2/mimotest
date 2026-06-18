from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.schemas.quality import (
    QualityInspectionCreate, QualityInspectionResponse, QualityInspectionDetailResponse,
    QualityIssueResponse, QualityIssueUpdate
)
from app.services.quality_service import QualityService

router = APIRouter()


@router.get("/inspections", response_model=list[QualityInspectionResponse])
def list_inspections(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    inspection_type: str | None = None,
    db: Session = Depends(get_db_session)
):
    service = QualityService(db)
    return service.list_inspections(skip=skip, limit=limit, inspection_type=inspection_type)


@router.get("/inspections/{inspection_id}", response_model=QualityInspectionDetailResponse)
def get_inspection(inspection_id: int, db: Session = Depends(get_db_session)):
    service = QualityService(db)
    inspection = service.get_inspection(inspection_id)
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return inspection


@router.post("/inspections", response_model=QualityInspectionResponse)
def create_inspection(data: QualityInspectionCreate, db: Session = Depends(get_db_session)):
    service = QualityService(db)
    return service.create_inspection(data)


@router.get("/issues", response_model=list[QualityIssueResponse])
def list_issues(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: str | None = None,
    db: Session = Depends(get_db_session)
):
    service = QualityService(db)
    return service.list_issues(skip=skip, limit=limit, status=status)


@router.put("/issues/{issue_id}", response_model=QualityIssueResponse)
def update_issue(issue_id: int, data: QualityIssueUpdate, db: Session = Depends(get_db_session)):
    service = QualityService(db)
    issue = service.update_issue(issue_id, data.status)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue
