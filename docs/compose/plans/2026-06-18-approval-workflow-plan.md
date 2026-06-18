# Approval Workflow System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a configurable multi-level approval workflow system that supports order, production, and purchase approvals with role-based and user-specific approvers.

**Architecture:** Approval flows are configured with multiple nodes, each specifying approvers by role or user. When documents need approval, instances are created and progress through nodes sequentially. Service layer hooks integrate approval checks into existing business logic.

**Tech Stack:** FastAPI, SQLAlchemy, React, Ant Design, Zustand

---

## File Structure

### Backend Files
```
backend/
├── app/
│   ├── models/
│   │   └── approval.py              # Create: approval models
│   ├── schemas/
│   │   └── approval.py              # Create: Pydantic schemas
│   ├── services/
│   │   └── approval_service.py      # Create: approval business logic
│   ├── api/v1/
│   │   └── approvals.py             # Create: approval API endpoints
│   └── alembic/versions/
│       └── xxx_add_approval_tables.py  # Create: migration
```

### Frontend Files
```
frontend/
├── src/
│   ├── api/
│   │   └── approvals.ts             # Create: approval API client
│   ├── pages/
│   │   └── approvals/
│   │       ├── PendingList.tsx       # Create: pending approvals page
│   │       ├── InitiatedList.tsx     # Create: my initiated approvals page
│   │       ├── ApprovalDetail.tsx    # Create: approval detail page
│   │       └── FlowConfig.tsx        # Create: flow configuration page
│   ├── App.tsx                       # Modify: add approval routes
│   └── components/
│       └── Sidebar.tsx               # Modify: add approval menu
```

---

## Task 1: Database Models

**Covers:** S2

**Files:**
- Create: `backend/app/models/approval.py`
- Modify: `backend/app/models/__init__.py`

- [ ] **Step 1: Create approval models**

```python
from sqlalchemy import Column, String, Integer, Text, Boolean, ForeignKey, JSON
from app.models.base import BaseModel


class ApprovalFlow(BaseModel):
    __tablename__ = "approval_flows"

    name = Column(String(100), nullable=False)
    business_type = Column(String(50), nullable=False, index=True)
    trigger_condition = Column(JSON, default={})
    is_active = Column(Boolean, default=True)


class ApprovalNode(BaseModel):
    __tablename__ = "approval_nodes"

    flow_id = Column(Integer, ForeignKey("approval_flows.id"), nullable=False)
    node_order = Column(Integer, nullable=False)
    node_name = Column(String(100), nullable=False)
    approver_type = Column(String(20), nullable=False)  # role/user
    approver_value = Column(String(100), nullable=False)  # role name or user ID
    action_on_reject = Column(String(20), default="reject_to_start")


class ApprovalInstance(BaseModel):
    __tablename__ = "approval_instances"

    flow_id = Column(Integer, ForeignKey("approval_flows.id"), nullable=False)
    business_type = Column(String(50), nullable=False, index=True)
    business_id = Column(Integer, nullable=False)
    initiator_id = Column(Integer, nullable=False)
    status = Column(String(20), default="pending")  # pending/approved/rejected/cancelled
    current_node_order = Column(Integer, default=1)


class ApprovalRecord(BaseModel):
    __tablename__ = "approval_records"

    instance_id = Column(Integer, ForeignKey("approval_instances.id"), nullable=False)
    node_id = Column(Integer, ForeignKey("approval_nodes.id"), nullable=False)
    approver_id = Column(Integer, nullable=False)
    action = Column(String(20), nullable=False)  # approve/reject
    comment = Column(Text, default="")
```

- [ ] **Step 2: Update models/__init__.py**

```python
from app.models.approval import ApprovalFlow, ApprovalNode, ApprovalInstance, ApprovalRecord

__all__ = [
    # ... existing models ...
    "ApprovalFlow", "ApprovalNode", "ApprovalInstance", "ApprovalRecord",
]
```

- [ ] **Step 3: Generate migration**

Run: `cd backend && alembic revision --autogenerate -m "add approval tables"`

- [ ] **Step 4: Verify migration file**

Check that the migration creates all 4 tables with correct columns.

- [ ] **Step 5: Commit**

```bash
git add backend/app/models/approval.py backend/app/models/__init__.py backend/alembic/versions/
git commit -m "feat: add approval workflow models and migration"
```

---

## Task 2: Approval Schemas

**Covers:** S3

**Files:**
- Create: `backend/app/schemas/approval.py`

- [ ] **Step 1: Create approval schemas**

```python
from datetime import datetime
from pydantic import BaseModel


class ApprovalNodeBase(BaseModel):
    node_order: int
    node_name: str
    approver_type: str  # role/user
    approver_value: str  # role name or user ID
    action_on_reject: str = "reject_to_start"


class ApprovalNodeCreate(ApprovalNodeBase):
    pass


class ApprovalNodeUpdate(BaseModel):
    node_order: int | None = None
    node_name: str | None = None
    approver_type: str | None = None
    approver_value: str | None = None
    action_on_reject: str | None = None


class ApprovalNodeResponse(ApprovalNodeBase):
    id: int
    flow_id: int

    class Config:
        from_attributes = True


class ApprovalFlowBase(BaseModel):
    name: str
    business_type: str
    trigger_condition: dict = {}
    is_active: bool = True


class ApprovalFlowCreate(ApprovalFlowBase):
    nodes: list[ApprovalNodeCreate] = []


class ApprovalFlowUpdate(BaseModel):
    name: str | None = None
    business_type: str | None = None
    trigger_condition: dict | None = None
    is_active: bool | None = None


class ApprovalFlowResponse(ApprovalFlowBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ApprovalFlowDetailResponse(ApprovalFlowResponse):
    nodes: list[ApprovalNodeResponse] = []


class ApprovalInstanceBase(BaseModel):
    flow_id: int
    business_type: str
    business_id: int
    initiator_id: int


class ApprovalInstanceCreate(ApprovalInstanceBase):
    pass


class ApprovalInstanceResponse(ApprovalInstanceBase):
    id: int
    status: str
    current_node_order: int
    created_at: datetime

    class Config:
        from_attributes = True


class ApprovalRecordBase(BaseModel):
    instance_id: int
    node_id: int
    approver_id: int
    action: str  # approve/reject
    comment: str = ""


class ApprovalRecordCreate(BaseModel):
    action: str
    comment: str = ""


class ApprovalRecordResponse(ApprovalRecordBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ApprovalInstanceDetailResponse(ApprovalInstanceResponse):
    nodes: list[ApprovalNodeResponse] = []
    records: list[ApprovalRecordResponse] = []
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/schemas/approval.py
git commit -m "feat: add approval workflow schemas"
```

---

## Task 3: Approval Service

**Covers:** S1, S5, S6

**Files:**
- Create: `backend/app/services/approval_service.py`

- [ ] **Step 1: Create approval service**

```python
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.approval import ApprovalFlow, ApprovalNode, ApprovalInstance, ApprovalRecord
from app.models.user import User


class ApprovalService:
    def __init__(self, db: Session):
        self.db = db

    def list_flows(self, skip: int = 0, limit: int = 100, business_type: str | None = None):
        query = self.db.query(ApprovalFlow)
        if business_type:
            query = query.filter(ApprovalFlow.business_type == business_type)
        return query.offset(skip).limit(limit).all()

    def get_flow(self, flow_id: int):
        return self.db.query(ApprovalFlow).filter(ApprovalFlow.id == flow_id).first()

    def get_flow_with_nodes(self, flow_id: int):
        flow = self.get_flow(flow_id)
        if flow:
            flow.nodes = self.db.query(ApprovalNode).filter(
                ApprovalNode.flow_id == flow_id
            ).order_by(ApprovalNode.node_order).all()
        return flow

    def create_flow(self, name: str, business_type: str, trigger_condition: dict = None, is_active: bool = True, nodes: list = None):
        flow = ApprovalFlow(
            name=name,
            business_type=business_type,
            trigger_condition=trigger_condition or {},
            is_active=is_active
        )
        self.db.add(flow)
        self.db.flush()

        if nodes:
            for node_data in nodes:
                node = ApprovalNode(flow_id=flow.id, **node_data)
                self.db.add(node)

        self.db.commit()
        self.db.refresh(flow)
        return flow

    def update_flow(self, flow_id: int, **kwargs):
        flow = self.get_flow(flow_id)
        if not flow:
            return None
        for key, value in kwargs.items():
            if value is not None:
                setattr(flow, key, value)
        self.db.commit()
        self.db.refresh(flow)
        return flow

    def delete_flow(self, flow_id: int):
        flow = self.get_flow(flow_id)
        if not flow:
            return False
        self.db.query(ApprovalNode).filter(ApprovalNode.flow_id == flow_id).delete()
        self.db.delete(flow)
        self.db.commit()
        return True

    def add_node(self, flow_id: int, node_order: int, node_name: str, approver_type: str, approver_value: str, action_on_reject: str = "reject_to_start"):
        node = ApprovalNode(
            flow_id=flow_id,
            node_order=node_order,
            node_name=node_name,
            approver_type=approver_type,
            approver_value=approver_value,
            action_on_reject=action_on_reject
        )
        self.db.add(node)
        self.db.commit()
        self.db.refresh(node)
        return node

    def update_node(self, node_id: int, **kwargs):
        node = self.db.query(ApprovalNode).filter(ApprovalNode.id == node_id).first()
        if not node:
            return None
        for key, value in kwargs.items():
            if value is not None:
                setattr(node, key, value)
        self.db.commit()
        self.db.refresh(node)
        return node

    def delete_node(self, node_id: int):
        node = self.db.query(ApprovalNode).filter(ApprovalNode.id == node_id).first()
        if not node:
            return False
        self.db.delete(node)
        self.db.commit()
        return True

    def find_matching_flow(self, business_type: str, context: dict = None):
        flows = self.db.query(ApprovalFlow).filter(
            and_(
                ApprovalFlow.business_type == business_type,
                ApprovalFlow.is_active == True
            )
        ).all()

        for flow in flows:
            if not flow.trigger_condition:
                return flow
            if context:
                match = True
                for key, value in flow.trigger_condition.items():
                    if key not in context or context[key] < value:
                        match = False
                        break
                if match:
                    return flow
        return None

    def create_instance(self, flow_id: int, business_type: str, business_id: int, initiator_id: int):
        instance = ApprovalInstance(
            flow_id=flow_id,
            business_type=business_type,
            business_id=business_id,
            initiator_id=initiator_id,
            status="pending",
            current_node_order=1
        )
        self.db.add(instance)
        self.db.commit()
        self.db.refresh(instance)
        return instance

    def get_instance(self, instance_id: int):
        return self.db.query(ApprovalInstance).filter(ApprovalInstance.id == instance_id).first()

    def get_instance_detail(self, instance_id: int):
        instance = self.get_instance(instance_id)
        if instance:
            instance.nodes = self.db.query(ApprovalNode).filter(
                ApprovalNode.flow_id == instance.flow_id
            ).order_by(ApprovalNode.node_order).all()
            instance.records = self.db.query(ApprovalRecord).filter(
                ApprovalRecord.instance_id == instance_id
            ).order_by(ApprovalRecord.created_at).all()
        return instance

    def get_pending_approvals(self, user_id: int, skip: int = 0, limit: int = 20):
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return []

        instances = self.db.query(ApprovalInstance).filter(
            ApprovalInstance.status == "pending"
        ).all()

        pending = []
        for instance in instances:
            current_node = self.db.query(ApprovalNode).filter(
                and_(
                    ApprovalNode.flow_id == instance.flow_id,
                    ApprovalNode.node_order == instance.current_node_order
                )
            ).first()

            if current_node:
                is_approver = False
                if current_node.approver_type == "role" and current_node.approver_value == user.role:
                    is_approver = True
                elif current_node.approver_type == "user" and current_node.approver_value == str(user_id):
                    is_approver = True

                if is_approver:
                    pending.append(instance)

        return pending[skip:skip + limit]

    def get_initiated_approvals(self, user_id: int, skip: int = 0, limit: int = 20):
        return self.db.query(ApprovalInstance).filter(
            ApprovalInstance.initiator_id == user_id
        ).order_by(ApprovalInstance.created_at.desc()).offset(skip).limit(limit).all()

    def approve(self, instance_id: int, approver_id: int, comment: str = ""):
        instance = self.get_instance(instance_id)
        if not instance or instance.status != "pending":
            return None

        current_node = self.db.query(ApprovalNode).filter(
            and_(
                ApprovalNode.flow_id == instance.flow_id,
                ApprovalNode.node_order == instance.current_node_order
            )
        ).first()

        if not current_node:
            return None

        record = ApprovalRecord(
            instance_id=instance_id,
            node_id=current_node.id,
            approver_id=approver_id,
            action="approve",
            comment=comment
        )
        self.db.add(record)

        next_node = self.db.query(ApprovalNode).filter(
            and_(
                ApprovalNode.flow_id == instance.flow_id,
                ApprovalNode.node_order > instance.current_node_order
            )
        ).order_by(ApprovalNode.node_order).first()

        if next_node:
            instance.current_node_order = next_node.node_order
        else:
            instance.status = "approved"

        self.db.commit()
        self.db.refresh(instance)
        return instance

    def reject(self, instance_id: int, approver_id: int, comment: str = ""):
        instance = self.get_instance(instance_id)
        if not instance or instance.status != "pending":
            return None

        current_node = self.db.query(ApprovalNode).filter(
            and_(
                ApprovalNode.flow_id == instance.flow_id,
                ApprovalNode.node_order == instance.current_node_order
            )
        ).first()

        if not current_node:
            return None

        record = ApprovalRecord(
            instance_id=instance_id,
            node_id=current_node.id,
            approver_id=approver_id,
            action="reject",
            comment=comment
        )
        self.db.add(record)

        if current_node.action_on_reject == "reject_to_start":
            instance.current_node_order = 1
        elif current_node.action_on_reject == "reject_to_prev":
            prev_node = self.db.query(ApprovalNode).filter(
                and_(
                    ApprovalNode.flow_id == instance.flow_id,
                    ApprovalNode.node_order < instance.current_node_order
                )
            ).order_by(ApprovalNode.node_order.desc()).first()
            if prev_node:
                instance.current_node_order = prev_node.node_order
            else:
                instance.current_node_order = 1

        instance.status = "rejected"
        self.db.commit()
        self.db.refresh(instance)
        return instance

    def cancel(self, instance_id: int, user_id: int):
        instance = self.get_instance(instance_id)
        if not instance or instance.status != "pending" or instance.initiator_id != user_id:
            return None

        instance.status = "cancelled"
        self.db.commit()
        self.db.refresh(instance)
        return instance
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/services/approval_service.py
git commit -m "feat: add approval workflow service"
```

---

## Task 4: Approval API Endpoints

**Covers:** S3

**Files:**
- Create: `backend/app/api/v1/approvals.py`
- Modify: `backend/app/api/v1/__init__.py`

- [ ] **Step 1: Create approval API**

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_admin, get_current_active_user
from app.models.user import User
from app.schemas.approval import (
    ApprovalFlowCreate, ApprovalFlowUpdate, ApprovalFlowResponse, ApprovalFlowDetailResponse,
    ApprovalNodeCreate, ApprovalNodeUpdate, ApprovalNodeResponse,
    ApprovalInstanceResponse, ApprovalInstanceDetailResponse,
    ApprovalRecordCreate, ApprovalRecordResponse
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
```

- [ ] **Step 2: Register router in api/v1/__init__.py**

Add to imports:
```python
from app.api.v1 import approvals
```

Add to router:
```python
api_router.include_router(approvals.router, prefix="/approvals", tags=["approvals"])
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/api/v1/approvals.py backend/app/api/v1/__init__.py
git commit -m "feat: add approval workflow API endpoints"
```

---

## Task 5: Seed Default Approval Flows

**Covers:** S5

**Files:**
- Modify: `backend/scripts/seed_admin.py`

- [ ] **Step 1: Add seed function for approval flows**

Add to `seed_admin.py`:

```python
from app.models.approval import ApprovalFlow, ApprovalNode


def seed_approval_flows():
    db = SessionLocal()
    existing = db.query(ApprovalFlow).first()
    if existing:
        print("Approval flows already exist")
        db.close()
        return

    # Order approval flow
    order_flow = ApprovalFlow(
        name="订单审批流程",
        business_type="order",
        trigger_condition={"min_amount": 10000},
        is_active=True
    )
    db.add(order_flow)
    db.flush()

    order_nodes = [
        ApprovalNode(flow_id=order_flow.id, node_order=1, node_name="部门经理审批", approver_type="role", approver_value="manager", action_on_reject="reject_to_start"),
        ApprovalNode(flow_id=order_flow.id, node_order=2, node_name="总经理审批", approver_type="role", approver_value="admin", action_on_reject="reject_to_start"),
    ]
    for node in order_nodes:
        db.add(node)

    # Production order approval flow
    prod_flow = ApprovalFlow(
        name="生产工单审批流程",
        business_type="production",
        trigger_condition={},
        is_active=True
    )
    db.add(prod_flow)
    db.flush()

    prod_nodes = [
        ApprovalNode(flow_id=prod_flow.id, node_order=1, node_name="生产主管审批", approver_type="role", approver_value="operator", action_on_reject="reject_to_start"),
        ApprovalNode(flow_id=prod_flow.id, node_order=2, node_name="质量经理审批", approver_type="role", approver_value="manager", action_on_reject="reject_to_prev"),
    ]
    for node in prod_nodes:
        db.add(node)

    db.commit()
    print("Default approval flows created")
    db.close()
```

Update `if __name__` block to call `seed_approval_flows()`.

- [ ] **Step 2: Commit**

```bash
git add backend/scripts/seed_admin.py
git commit -m "feat: add default approval flows seeding"
```

---

## Task 6: Integrate Approval into Order Service

**Covers:** S6

**Files:**
- Modify: `backend/app/services/order_service.py`

- [ ] **Step 1: Add approval integration to order creation**

Add import at top:
```python
from app.services.approval_service import ApprovalService
```

In `create_order` method, after creating the order, add:
```python
# Check if approval is needed
approval_service = ApprovalService(self.db)
context = {"min_amount": float(order.total_amount) if order.total_amount else 0}
flow = approval_service.find_matching_flow("order", context)
if flow:
    instance = approval_service.create_instance(
        flow_id=flow.id,
        business_type="order",
        business_id=order.id,
        initiator_id=order.customer_id  # or use actual user_id if available
    )
    order.status = "pending_approval"
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/services/order_service.py
git commit -m "feat: integrate approval workflow into order service"
```

---

## Task 7: Frontend Approval API Client

**Covers:** S4

**Files:**
- Create: `frontend/src/api/approvals.ts`

- [ ] **Step 1: Create approval API client**

```typescript
import client from './client';

export interface ApprovalFlow {
  id: number;
  name: string;
  business_type: string;
  trigger_condition: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface ApprovalNode {
  id: number;
  flow_id: number;
  node_order: number;
  node_name: string;
  approver_type: string;
  approver_value: string;
  action_on_reject: string;
}

export interface ApprovalInstance {
  id: number;
  flow_id: number;
  business_type: string;
  business_id: number;
  initiator_id: number;
  status: string;
  current_node_order: number;
  created_at: string;
}

export interface ApprovalRecord {
  id: number;
  instance_id: number;
  node_id: number;
  approver_id: number;
  action: string;
  comment: string;
  created_at: string;
}

export const approvalApi = {
  // Flow management
  listFlows: (params?: { skip?: number; limit?: number; business_type?: string }) =>
    client.get<ApprovalFlow[]>('/approvals/flows', { params }),

  createFlow: (data: {
    name: string;
    business_type: string;
    trigger_condition?: Record<string, any>;
    nodes?: Array<{
      node_order: number;
      node_name: string;
      approver_type: string;
      approver_value: string;
      action_on_reject?: string;
    }>;
  }) => client.post<ApprovalFlow>('/approvals/flows', data),

  getFlow: (id: number) =>
    client.get<ApprovalFlow & { nodes: ApprovalNode[] }>(`/approvals/flows/${id}`),

  updateFlow: (id: number, data: { name?: string; business_type?: string; trigger_condition?: Record<string, any>; is_active?: boolean }) =>
    client.put<ApprovalFlow>(`/approvals/flows/${id}`, data),

  deleteFlow: (id: number) =>
    client.delete(`/approvals/flows/${id}`),

  addNode: (flowId: number, data: {
    node_order: number;
    node_name: string;
    approver_type: string;
    approver_value: string;
    action_on_reject?: string;
  }) => client.post<ApprovalNode>(`/approvals/flows/${flowId}/nodes`, data),

  updateNode: (flowId: number, nodeId: number, data: {
    node_order?: number;
    node_name?: string;
    approver_type?: string;
    approver_value?: string;
    action_on_reject?: string;
  }) => client.put<ApprovalNode>(`/approvals/flows/${flowId}/nodes/${nodeId}`, data),

  deleteNode: (flowId: number, nodeId: number) =>
    client.delete(`/approvals/flows/${flowId}/nodes/${nodeId}`),

  // Approval operations
  getPending: (params?: { skip?: number; limit?: number }) =>
    client.get<ApprovalInstance[]>('/approvals/pending', { params }),

  getInitiated: (params?: { skip?: number; limit?: number }) =>
    client.get<ApprovalInstance[]>('/approvals/initiated', { params }),

  getDetail: (instanceId: number) =>
    client.get<ApprovalInstance & { nodes: ApprovalNode[]; records: ApprovalRecord[] }>(`/approvals/${instanceId}`),

  approve: (instanceId: number, comment?: string) =>
    client.post<ApprovalInstance>(`/approvals/${instanceId}/approve`, { action: 'approve', comment: comment || '' }),

  reject: (instanceId: number, comment?: string) =>
    client.post<ApprovalInstance>(`/approvals/${instanceId}/reject`, { action: 'reject', comment: comment || '' }),

  cancel: (instanceId: number) =>
    client.post<ApprovalInstance>(`/approvals/${instanceId}/cancel`),
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/api/approvals.ts
git commit -m "feat: add approval workflow API client"
```

---

## Task 8: Frontend Pending Approvals Page

**Covers:** S4

**Files:**
- Create: `frontend/src/pages/approvals/PendingList.tsx`

- [ ] **Step 1: Create PendingList page**

```tsx
import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Input, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { approvalApi, ApprovalInstance } from '../../api/approvals';

const statusColors: Record<string, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  cancelled: 'default',
};

const businessTypeLabels: Record<string, string> = {
  order: '订单',
  production: '生产工单',
  purchase: '采购单',
};

const PendingList = () => {
  const navigate = useNavigate();
  const [instances, setInstances] = useState<ApprovalInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [currentInstanceId, setCurrentInstanceId] = useState<number | null>(null);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await approvalApi.getPending({ limit: 50 });
      setInstances(res.data);
    } catch (error) {
      message.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleAction = async () => {
    if (!currentInstanceId) return;
    try {
      if (currentAction === 'approve') {
        await approvalApi.approve(currentInstanceId, comment);
        message.success('Approved');
      } else {
        await approvalApi.reject(currentInstanceId, comment);
        message.success('Rejected');
      }
      setCommentModalOpen(false);
      setComment('');
      loadPending();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || 'Operation failed');
    }
  };

  const openActionModal = (instanceId: number, action: 'approve' | 'reject') => {
    setCurrentInstanceId(instanceId);
    setCurrentAction(action);
    setCommentModalOpen(true);
  };

  const columns = [
    {
      title: '业务类型',
      dataIndex: 'business_type',
      key: 'business_type',
      render: (type: string) => businessTypeLabels[type] || type,
    },
    {
      title: '单据ID',
      dataIndex: 'business_id',
      key: 'business_id',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: '当前节点',
      dataIndex: 'current_node_order',
      key: 'current_node_order',
      render: (order: number) => `第 ${order} 级`,
    },
    {
      title: '发起时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (t: string) => new Date(t).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApprovalInstance) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => openActionModal(record.id, 'approve')}
          >
            通过
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseOutlined />}
            onClick={() => openActionModal(record.id, 'reject')}
          >
            驳回
          </Button>
          <Button
            size="small"
            onClick={() => navigate(`/approvals/${record.id}`)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>待我审批</h2>
      <Table
        columns={columns}
        dataSource={instances}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title={currentAction === 'approve' ? '审批通过' : '审批驳回'}
        open={commentModalOpen}
        onCancel={() => { setCommentModalOpen(false); setComment(''); }}
        onOk={handleAction}
      >
        <Input.TextArea
          rows={4}
          placeholder="请输入审批意见（可选）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default PendingList;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/approvals/PendingList.tsx
git commit -m "feat: add pending approvals page"
```

---

## Task 9: Frontend Initiated Approvals Page

**Covers:** S4

**Files:**
- Create: `frontend/src/pages/approvals/InitiatedList.tsx`

- [ ] **Step 1: Create InitiatedList page**

```tsx
import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Popconfirm, message } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { approvalApi, ApprovalInstance } from '../../api/approvals';

const statusColors: Record<string, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  cancelled: 'default',
};

const businessTypeLabels: Record<string, string> = {
  order: '订单',
  production: '生产工单',
  purchase: '采购单',
};

const InitiatedList = () => {
  const navigate = useNavigate();
  const [instances, setInstances] = useState<ApprovalInstance[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInitiated = async () => {
    setLoading(true);
    try {
      const res = await approvalApi.getInitiated({ limit: 50 });
      setInstances(res.data);
    } catch (error) {
      message.error('Failed to load initiated approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitiated();
  }, []);

  const handleCancel = async (instanceId: number) => {
    try {
      await approvalApi.cancel(instanceId);
      message.success('Approval cancelled');
      loadInitiated();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || 'Operation failed');
    }
  };

  const columns = [
    {
      title: '业务类型',
      dataIndex: 'business_type',
      key: 'business_type',
      render: (type: string) => businessTypeLabels[type] || type,
    },
    {
      title: '单据ID',
      dataIndex: 'business_id',
      key: 'business_id',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: '当前节点',
      dataIndex: 'current_node_order',
      key: 'current_node_order',
      render: (order: number, record: ApprovalInstance) =>
        record.status === 'pending' ? `第 ${order} 级` : '-',
    },
    {
      title: '发起时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (t: string) => new Date(t).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApprovalInstance) => (
        <Space>
          {record.status === 'pending' && (
            <Popconfirm
              title="确定要撤销这个审批吗？"
              onConfirm={() => handleCancel(record.id)}
            >
              <Button danger size="small" icon={<CloseCircleOutlined />}>
                撤销
              </Button>
            </Popconfirm>
          )}
          <Button
            size="small"
            onClick={() => navigate(`/approvals/${record.id}`)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>我发起的</h2>
      <Table
        columns={columns}
        dataSource={instances}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
};

export default InitiatedList;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/approvals/InitiatedList.tsx
git commit -m "feat: add initiated approvals page"
```

---

## Task 10: Frontend Approval Detail Page

**Covers:** S4

**Files:**
- Create: `frontend/src/pages/approvals/ApprovalDetail.tsx`

- [ ] **Step 1: Create ApprovalDetail page**

```tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Steps, Table, Button, Tag, Space, Modal, Input, message, Descriptions } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { approvalApi, ApprovalInstance, ApprovalNode, ApprovalRecord } from '../../api/approvals';

const statusColors: Record<string, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  cancelled: 'default',
};

const businessTypeLabels: Record<string, string> = {
  order: '订单',
  production: '生产工单',
  purchase: '采购单',
};

const ApprovalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [instance, setInstance] = useState<(ApprovalInstance & { nodes: ApprovalNode[]; records: ApprovalRecord[] }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');

  const loadDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await approvalApi.getDetail(parseInt(id));
      setInstance(res.data);
    } catch (error) {
      message.error('Failed to load approval details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleAction = async () => {
    if (!id) return;
    try {
      if (currentAction === 'approve') {
        await approvalApi.approve(parseInt(id), comment);
        message.success('Approved');
      } else {
        await approvalApi.reject(parseInt(id), comment);
        message.success('Rejected');
      }
      setCommentModalOpen(false);
      setComment('');
      loadDetail();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || 'Operation failed');
    }
  };

  const openActionModal = (action: 'approve' | 'reject') => {
    setCurrentAction(action);
    setCommentModalOpen(true);
  };

  if (!instance) return null;

  const currentStep = instance.nodes.findIndex(n => n.node_order === instance.current_node_order);

  const recordColumns = [
    {
      title: '节点',
      dataIndex: 'node_id',
      key: 'node_id',
      render: (nodeId: number) => {
        const node = instance.nodes.find(n => n.id === nodeId);
        return node?.node_name || nodeId;
      },
    },
    {
      title: '审批人',
      dataIndex: 'approver_id',
      key: 'approver_id',
    },
    {
      title: '动作',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag color={action === 'approve' ? 'green' : 'red'}>
          {action === 'approve' ? '通过' : '驳回'}
        </Tag>
      ),
    },
    {
      title: '意见',
      dataIndex: 'comment',
      key: 'comment',
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (t: string) => new Date(t).toLocaleString(),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>审批详情</h2>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions>
          <Descriptions.Item label="业务类型">{businessTypeLabels[instance.business_type] || instance.business_type}</Descriptions.Item>
          <Descriptions.Item label="单据ID">{instance.business_id}</Descriptions.Item>
          <Descriptions.Item label="状态"><Tag color={statusColors[instance.status]}>{instance.status}</Tag></Descriptions.Item>
          <Descriptions.Item label="当前节点">第 {instance.current_node_order} 级</Descriptions.Item>
          <Descriptions.Item label="发起时间">{new Date(instance.created_at).toLocaleString()}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="审批流程" style={{ marginBottom: 16 }}>
        <Steps
          current={currentStep}
          status={instance.status === 'rejected' ? 'error' : instance.status === 'approved' ? 'finish' : 'process'}
          items={instance.nodes.map((node) => ({
            title: node.node_name,
            description: `${node.approver_type === 'role' ? '角色' : '用户'}: ${node.approver_value}`,
          }))}
        />
      </Card>

      {instance.status === 'pending' && (
        <Card style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" icon={<CheckOutlined />} onClick={() => openActionModal('approve')}>
              审批通过
            </Button>
            <Button danger icon={<CloseOutlined />} onClick={() => openActionModal('reject')}>
              审批驳回
            </Button>
          </Space>
        </Card>
      )}

      <Card title="审批记录">
        <Table
          columns={recordColumns}
          dataSource={instance.records}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title={currentAction === 'approve' ? '审批通过' : '审批驳回'}
        open={commentModalOpen}
        onCancel={() => { setCommentModalOpen(false); setComment(''); }}
        onOk={handleAction}
      >
        <Input.TextArea
          rows={4}
          placeholder="请输入审批意见（可选）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ApprovalDetail;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/approvals/ApprovalDetail.tsx
git commit -m "feat: add approval detail page"
```

---

## Task 11: Frontend Flow Configuration Page

**Covers:** S4

**Files:**
- Create: `frontend/src/pages/approvals/FlowConfig.tsx`

- [ ] **Step 1: Create FlowConfig page**

```tsx
import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, Switch, InputNumber, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { approvalApi, ApprovalFlow, ApprovalNode } from '../../api/approvals';

const FlowConfig = () => {
  const [flows, setFlows] = useState<ApprovalFlow[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<ApprovalFlow | null>(null);
  const [form] = Form.useForm();

  const loadFlows = async () => {
    setLoading(true);
    try {
      const res = await approvalApi.listFlows({ limit: 100 });
      setFlows(res.data);
    } catch (error) {
      message.error('Failed to load flows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlows();
  }, []);

  const handleSave = async (values: any) => {
    try {
      if (editingFlow) {
        await approvalApi.updateFlow(editingFlow.id, values);
        message.success('Flow updated');
      } else {
        await approvalApi.createFlow(values);
        message.success('Flow created');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingFlow(null);
      loadFlows();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await approvalApi.deleteFlow(id);
      message.success('Flow deleted');
      loadFlows();
    } catch (error) {
      message.error('Failed to delete flow');
    }
  };

  const openEdit = (flow: ApprovalFlow) => {
    setEditingFlow(flow);
    form.setFieldsValue({
      name: flow.name,
      business_type: flow.business_type,
      trigger_condition: JSON.stringify(flow.trigger_condition),
      is_active: flow.is_active,
    });
    setModalOpen(true);
  };

  const columns = [
    {
      title: '流程名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '业务类型',
      dataIndex: 'business_type',
      key: 'business_type',
    },
    {
      title: '触发条件',
      dataIndex: 'trigger_condition',
      key: 'trigger_condition',
      render: (condition: Record<string, any>) => JSON.stringify(condition),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApprovalFlow) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除这个流程吗？" onConfirm={() => handleDelete(record.id)}>
            <Button danger size="small" icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>审批流程配置</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingFlow(null); form.resetFields(); setModalOpen(true); }}
        >
          新建流程
        </Button>
      </div>
      <Table columns={columns} dataSource={flows} loading={loading} rowKey="id" />

      <Modal
        title={editingFlow ? '编辑流程' : '新建流程'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingFlow(null); }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="流程名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="business_type" label="业务类型" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'order', label: '订单' },
                { value: 'production', label: '生产工单' },
                { value: 'purchase', label: '采购单' },
              ]}
            />
          </Form.Item>
          <Form.Item name="trigger_condition" label="触发条件（JSON）">
            <Input.TextArea rows={2} placeholder='{"min_amount": 10000}' />
          </Form.Item>
          {editingFlow && (
            <Form.Item name="is_active" label="启用" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default FlowConfig;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/approvals/FlowConfig.tsx
git commit -m "feat: add flow configuration page"
```

---

## Task 12: Frontend Routing and Sidebar

**Covers:** S4

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/Sidebar.tsx`

- [ ] **Step 1: Update App.tsx**

Read the current App.tsx file first. Then add imports and routes:

```tsx
import PendingList from './pages/approvals/PendingList';
import InitiatedList from './pages/approvals/InitiatedList';
import ApprovalDetail from './pages/approvals/ApprovalDetail';
import FlowConfig from './pages/approvals/FlowConfig';

// Add routes inside the protected route:
<Route path="approvals/pending" element={<PendingList />} />
<Route path="approvals/initiated" element={<InitiatedList />} />
<Route path="approvals/flows" element={<FlowConfig />} />
<Route path="approvals/:id" element={<ApprovalDetail />} />
```

- [ ] **Step 2: Update Sidebar.tsx**

Read the current Sidebar.tsx file first. Then add menu item:

```tsx
import { AuditOutlined } from '@ant-design/icons';

// Add to menuItems array:
{
  key: '/approvals',
  icon: <AuditOutlined />,
  label: '审批管理',
  children: [
    { key: '/approvals/pending', label: '待我审批' },
    { key: '/approvals/initiated', label: '我发起的' },
    ...(hasRole('admin') ? [{ key: '/approvals/flows', label: '流程配置' }] : []),
  ],
},
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.tsx frontend/src/components/Sidebar.tsx
git commit -m "feat: add approval routes and sidebar menu"
```

---

## Task 13: Final Integration and Testing

**Covers:** S1, S2, S3, S4, S5, S6

- [ ] **Step 1: Run database migration**

```bash
cd backend && alembic upgrade head
```

- [ ] **Step 2: Seed approval flows**

```bash
cd backend && python scripts/seed_admin.py
```

- [ ] **Step 3: Verify backend starts without errors**

```bash
cd backend && python -c "from app.main import app; print('Backend OK')"
```

- [ ] **Step 4: Verify frontend builds**

```bash
cd frontend && npm run build
```

- [ ] **Step 5: Commit any final changes**

```bash
git add -A
git commit -m "feat: complete approval workflow system implementation"
```
