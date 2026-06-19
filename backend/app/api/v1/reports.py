from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime

from app.api.deps import get_db_session, get_current_active_user
from app.models.user import User
from app.services.report_service import ReportService

router = APIRouter()


@router.get("/orders/{order_id}")
def export_single_order(
    order_id: int,
    format: str = Query("xlsx", description="xlsx/pdf"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    service = ReportService(db)
    try:
        if format == "xlsx":
            buf = service.export_single_order_xlsx(order_id)
        elif format == "pdf":
            buf = service.export_single_order_pdf(order_id)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {format}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    filename = f"order_{order_id}.{format}"
    media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" if format == "xlsx" else "application/pdf"
    return StreamingResponse(
        buf,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/export")
def export_report(
    type: str = Query(..., description="orders/production/quality/inventory"),
    format: str = Query("xlsx", description="xlsx/pdf"),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    service = ReportService(db)
    try:
        buf = service.export(type, format)
    except ValueError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{type}_{timestamp}.{format}"
    media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" if format == "xlsx" else "application/pdf"
    return StreamingResponse(
        buf,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
