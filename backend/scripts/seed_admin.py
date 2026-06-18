import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.notification import NotificationRule
from app.models.approval import ApprovalFlow, ApprovalNode


def seed():
    db = SessionLocal()
    existing = db.query(User).filter(User.role == "admin").first()
    if existing:
        print(f"Admin user already exists: {existing.email}")
        db.close()
        return
    admin = User(
        username="admin",
        email="admin@erp.local",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        is_active=True,
    )
    db.add(admin)
    db.commit()
    print("Admin user created: admin@erp.local / admin123")
    db.close()


def seed_notification_rules():
    db = SessionLocal()
    existing = db.query(NotificationRule).first()
    if existing:
        print("Notification rules already exist")
        db.close()
        return

    rules = [
        NotificationRule(event_type="order_created", role="manager", is_active=True),
        NotificationRule(event_type="order_status_changed", role="operator", is_active=True),
        NotificationRule(event_type="inventory_low", role="manager", is_active=True),
        NotificationRule(event_type="quality_issue_created", role="manager", is_active=True),
        NotificationRule(event_type="production_created", role="operator", is_active=True),
    ]
    for rule in rules:
        db.add(rule)
    db.commit()
    print("Default notification rules created")
    db.close()


def seed_approval_flows():
    db = SessionLocal()
    existing = db.query(ApprovalFlow).first()
    if existing:
        print("Approval flows already exist")
        db.close()
        return

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


if __name__ == "__main__":
    seed()
    seed_notification_rules()
    seed_approval_flows()
