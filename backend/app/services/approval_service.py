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
                continue
            condition_type = flow.trigger_condition.get("condition_type", "manual")
            if condition_type == "manual":
                continue
            if condition_type == "always":
                return flow
            if condition_type == "amount" and context:
                threshold = flow.trigger_condition.get("threshold", 0)
                if context.get("amount", 0) >= threshold:
                    return flow
            if condition_type == "quantity" and context:
                threshold = flow.trigger_condition.get("threshold", 0)
                if context.get("quantity", 0) >= threshold:
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

    def get_approval_records_by_business(self, business_type: str, business_id: int):
        instances = self.db.query(ApprovalInstance).filter(
            and_(
                ApprovalInstance.business_type == business_type,
                ApprovalInstance.business_id == business_id
            )
        ).all()
        if not instances:
            return []
        instance_ids = [inst.id for inst in instances]
        records = self.db.query(ApprovalRecord).filter(
            ApprovalRecord.instance_id.in_(instance_ids)
        ).order_by(ApprovalRecord.created_at.desc()).all()

        instance_map = {inst.id: inst for inst in instances}
        node_ids = {r.node_id for r in records}
        nodes = self.db.query(ApprovalNode).filter(ApprovalNode.id.in_(node_ids)).all()
        node_map = {n.id: n for n in nodes}

        result = []
        for record in records:
            instance = instance_map.get(record.instance_id)
            node = node_map.get(record.node_id)
            result.append({
                "id": record.id,
                "instance_id": record.instance_id,
                "node_id": record.node_id,
                "node_name": node.node_name if node else "",
                "approver_id": record.approver_id,
                "action": record.action,
                "comment": record.comment,
                "created_at": record.created_at,
                "instance_status": instance.status if instance else "",
            })
        return result

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
