import uuid
from decimal import Decimal
from sqlalchemy.orm import Session

from app.models.procurement import (
    Supplier, PurchaseRequest, PurchaseRequestItem,
    PurchaseOrder, PurchaseOrderItem
)
from app.models.inventory import Material
from app.services.approval_service import ApprovalService


class ProcurementService:
    def __init__(self, db: Session):
        self.db = db

    # === Suppliers ===
    def list_suppliers(self, skip=0, limit=100):
        return self.db.query(Supplier).offset(skip).limit(limit).all()

    def get_supplier(self, id):
        return self.db.query(Supplier).filter(Supplier.id == id).first()

    def create_supplier(self, data):
        s = Supplier(**data.model_dump())
        self.db.add(s)
        self.db.commit()
        self.db.refresh(s)
        return s

    def update_supplier(self, id, data):
        s = self.get_supplier(id)
        if not s:
            return None
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(s, k, v)
        self.db.commit()
        self.db.refresh(s)
        return s

    def delete_supplier(self, id):
        s = self.get_supplier(id)
        if not s:
            return False
        self.db.delete(s)
        self.db.commit()
        return True

    # === Purchase Requests ===
    def list_requests(self, skip=0, limit=100, status=None):
        q = self.db.query(PurchaseRequest)
        if status:
            q = q.filter(PurchaseRequest.status == status)
        return q.order_by(PurchaseRequest.created_at.desc()).offset(skip).limit(limit).all()

    def get_request(self, id):
        return self.db.query(PurchaseRequest).filter(PurchaseRequest.id == id).first()

    def get_request_detail(self, id):
        req = self.get_request(id)
        if req:
            req.items = self.db.query(PurchaseRequestItem).filter(PurchaseRequestItem.request_id == id).all()
        return req

    def create_request(self, data, user_id):
        req_no = f"PR-{uuid.uuid4().hex[:16].upper()}"
        total = sum(Decimal(str(item.quantity)) * Decimal(str(item.unit_price)) for item in data.items)
        req = PurchaseRequest(
            request_no=req_no, supplier_id=data.supplier_id,
            total_amount=total, remarks=data.remarks, initiator_id=user_id, status="draft"
        )
        self.db.add(req)
        self.db.flush()
        for item_data in data.items:
            item = PurchaseRequestItem(request_id=req.id, **item_data.model_dump())
            self.db.add(item)
        self.db.commit()
        self.db.refresh(req)
        return req

    def submit_request(self, id, user_id):
        req = self.get_request(id)
        if not req or req.status != "draft":
            return None, "Cannot submit"
        approval_service = ApprovalService(self.db)
        flows = approval_service.list_flows(business_type="purchase")
        active = [f for f in flows if f.is_active]
        if active:
            approval_service.create_instance(
                flow_id=active[0].id, business_type="purchase",
                business_id=req.id, initiator_id=user_id
            )
            req.status = "pending_approval"
        else:
            req.status = "approved"
        self.db.commit()
        self.db.refresh(req)
        return req, None

    def delete_request(self, id):
        req = self.get_request(id)
        if not req:
            return False
        self.db.delete(req)
        self.db.commit()
        return True

    # === Purchase Orders ===
    def list_orders(self, skip=0, limit=100, status=None):
        q = self.db.query(PurchaseOrder)
        if status:
            q = q.filter(PurchaseOrder.status == status)
        return q.order_by(PurchaseOrder.created_at.desc()).offset(skip).limit(limit).all()

    def get_order(self, id):
        return self.db.query(PurchaseOrder).filter(PurchaseOrder.id == id).first()

    def get_order_detail(self, id):
        order = self.get_order(id)
        if order:
            order.items = self.db.query(PurchaseOrderItem).filter(PurchaseOrderItem.order_id == id).all()
        return order

    def create_order(self, data):
        order_no = f"PO-{uuid.uuid4().hex[:16].upper()}"
        total = sum(Decimal(str(item.quantity)) * Decimal(str(item.unit_price)) for item in data.items)
        order = PurchaseOrder(
            order_no=order_no, request_id=data.request_id, supplier_id=data.supplier_id,
            total_amount=total, delivery_date=data.delivery_date, remarks=data.remarks, status="pending"
        )
        self.db.add(order)
        self.db.flush()
        for item_data in data.items:
            item = PurchaseOrderItem(order_id=order.id, **item_data.model_dump())
            self.db.add(item)
        self.db.commit()
        self.db.refresh(order)
        return order

    def receive_items(self, order_id, items):
        order = self.get_order(order_id)
        if not order:
            return None, "Order not found"
        for recv in items:
            item = self.db.query(PurchaseOrderItem).filter(PurchaseOrderItem.id == recv.item_id).first()
            if item:
                item.received_quantity += Decimal(str(recv.quantity))
                material = self.db.query(Material).filter(Material.id == item.material_id).first()
                if material:
                    material.current_stock += Decimal(str(recv.quantity))
        all_received = all(
            i.received_quantity >= i.quantity
            for i in self.db.query(PurchaseOrderItem).filter(PurchaseOrderItem.order_id == order_id).all()
        )
        if all_received:
            order.status = "received"
        else:
            order.status = "ordered"
        self.db.commit()
        self.db.refresh(order)
        return order, None

    def delete_order(self, id):
        order = self.get_order(id)
        if not order:
            return False
        self.db.delete(order)
        self.db.commit()
        return True
