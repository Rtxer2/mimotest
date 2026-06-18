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
