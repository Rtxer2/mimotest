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
