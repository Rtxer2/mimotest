from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_admin, get_current_active_user
from app.models.user import User
from app.schemas.approval import (
    ApprovalFlowCreate, ApprovalFlowUpdate, ApprovalFlowResponse, ApprovalFlowDetailResponse,
    ApprovalNodeCreate, ApprovalNodeUpdate, ApprovalNodeResponse,
    ApprovalInstanceResponse, ApprovalInstanceDetailResponse,
    ApprovalRecordCreate
)
from app.services.approval_service import ApprovalService

router = APIRouter()


# Flow management (admin only)
@router.get("/flows", response_model=list[ApprovalFlowResponse])
def list_flows(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    business_type: str | None = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db_session)
):
    service = ApprovalService(db)
    return service.list_flows(skip=skip, limit=limit, business_type=business_type)


@router.post("/flows", response_model=ApprovalFlowResponse)
def create_flow(
    data: ApprovalFlowCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db_session)
):
    service = ApprovalService(db)
    return service.create_flow(
        name=data.name,
        business_type=data.business_type,
        trigger_condition=data.trigger_condition,
        is_active=data.is_active,
        nodes=[node.model_dump() for node in data.nodes]
    )


@router.get("/flows/{flow_id}", response_model=ApprovalFlowDetailResponse)
def get_flow(
    flow_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db_session)
):
    service = ApprovalService(db)
    flow = service.get_flow_with_nodes(flow_id)
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")
    return flow


@router.put("/flows/{flow_id}", response_model=ApprovalFlowResponse)
def update_flow(
    flow_id: int,
    data: ApprovalFlowUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db_session)
):
    service = ApprovalService(db)
    flow = service.update_flow(flow_id, **data.model_dump(exclude_unset=True))
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")
    return flow


@router.delete("/flows/{flow_id}")
def delete_flow(
    flow_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db_session)
):
    service = ApprovalService(db)
    if not service.delete_flow(flow_id):
        raise HTTPException(status_code=404, detail="Flow not found")
    return {"message": "Flow deleted"}


@router.post("/flows/{flow_id}/nodes", response_model=ApprovalNodeResponse)
def add_node(
    flow_id: int,
    data: ApprovalNodeCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db_session)
):
    service = ApprovalService(db)
    return service.add_node(flow_id, **data.model_dump())


@router.put("/flows/{flow_id}/nodes/{node_id}", response_model=ApprovalNodeResponse)
def update_node(
    flow_id: int,
    node_id: int,
    data: ApprovalNodeUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db_session)
):
    service = ApprovalService(db)
    node = service.update_node(node_id, **data.model_dump(exclude_unset=True))
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node


@router.delete("/flows/{flow_id}/nodes/{node_id}")
def delete_node(
    flow_id: int,
    node_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db_session)
):
    service = ApprovalService(db)
    if not service.delete_node(node_id):
        raise HTTPException(status_code=404, detail="Node not found")
    return {"message": "Node deleted"}


# Approval operations
@router.get("/pending", response_model=list[ApprovalInstanceResponse])
def get_pending_approvals(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db_session)
):
    service = ApprovalService(db)
    return service.get_pending_approvals(current_user.id, skip=skip, limit=limit)


@router.get("/initiated", response_model=list[ApprovalInstanceResponse])
def get_initiated_approvals(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db_session)
):
    service = ApprovalService(db)
    return service.get_initiated_approvals(current_user.id, skip=skip, limit=limit)


@router.get("/{instance_id}", response_model=ApprovalInstanceDetailResponse)
def get_approval_detail(
    instance_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db_session)
):
    service = ApprovalService(db)
    instance = service.get_instance_detail(instance_id)
    if not instance:
        raise HTTPException(status_code=404, detail="Approval instance not found")
    return instance


@router.post("/{instance_id}/approve", response_model=ApprovalInstanceResponse)
def approve(
    instance_id: int,
    data: ApprovalRecordCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db_session)
):
    service = ApprovalService(db)
    instance = service.approve(instance_id, current_user.id, data.comment)
    if not instance:
        raise HTTPException(status_code=400, detail="Cannot approve this instance")
    return instance


@router.post("/{instance_id}/reject", response_model=ApprovalInstanceResponse)
def reject(
    instance_id: int,
    data: ApprovalRecordCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db_session)
):
    service = ApprovalService(db)
    instance = service.reject(instance_id, current_user.id, data.comment)
    if not instance:
        raise HTTPException(status_code=400, detail="Cannot reject this instance")
    return instance


@router.post("/{instance_id}/cancel", response_model=ApprovalInstanceResponse)
def cancel(
    instance_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db_session)
):
    service = ApprovalService(db)
    instance = service.cancel(instance_id, current_user.id)
    if not instance:
        raise HTTPException(status_code=400, detail="Cannot cancel this instance")
    return instance
