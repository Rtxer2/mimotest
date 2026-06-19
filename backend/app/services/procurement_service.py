import uuid
from decimal import Decimal
from sqlalchemy.orm import Session

from app.models.procurement import (
    Supplier, Department, Warehouse,
    PurchaseRequest, PurchaseRequestItem,
    PurchaseOrder, PurchaseOrderItem,
    PurchaseReturn, PurchaseReturnItem
)
from app.models.inventory import Material
from app.services.approval_service import ApprovalService


class ProcurementService:
    def __init__(self, db: Session):
        self.db = db

    # === Suppliers ===
    def list_suppliers(self, skip=0, limit=100):
        return self.db.query(Supplier).offset(skip).limit(limit).all()

    def search_suppliers(self, q: str, limit: int = 20):
        from sqlalchemy import or_
        return self.db.query(Supplier).filter(
            or_(Supplier.name.ilike(f"%{q}%"), Supplier.code.ilike(f"%{q}%"))
        ).limit(limit).all()

    def get_supplier(self, id):
        return self.db.query(Supplier).filter(Supplier.id == id).first()

    def create_supplier(self, data):
        s = Supplier(**data.model_dump())
        if not s.code:
            s.code = f"SUP-{uuid.uuid4().hex[:8].upper()}"
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
    def _enrich_with_supplier_name(self, items):
        if not items:
            return items
        supplier_ids = list(set(item.supplier_id for item in items))
        suppliers = self.db.query(Supplier).filter(Supplier.id.in_(supplier_ids)).all()
        supplier_map = {s.id: s.name for s in suppliers}
        for item in items:
            item.supplier_name = supplier_map.get(item.supplier_id, "")
        return items

    def list_requests(self, skip=0, limit=100, status=None):
        q = self.db.query(PurchaseRequest)
        if status:
            q = q.filter(PurchaseRequest.status == status)
        items = q.order_by(PurchaseRequest.created_at.desc()).offset(skip).limit(limit).all()
        return self._enrich_with_supplier_name(items)

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
        items = q.order_by(PurchaseOrder.created_at.desc()).offset(skip).limit(limit).all()
        return self._enrich_with_supplier_name(items)

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

    def receive_items(self, order_id, receive_data):
        order = self.get_order(order_id)
        if not order:
            return None, "Order not found"
        for recv in receive_data:
            item = self.db.query(PurchaseOrderItem).filter(PurchaseOrderItem.id == recv.item_id).first()
            if not item:
                continue
            item.received_quantity += Decimal(str(recv.pass_quantity)) + Decimal(str(recv.reject_quantity))
            if recv.pass_quantity > 0:
                if item.item_type == "material" and item.material_id:
                    material = self.db.query(Material).filter(Material.id == item.material_id).first()
                    if material:
                        material.current_stock += Decimal(str(recv.pass_quantity))
                elif item.item_type == "product" and item.product_id:
                    from app.models.inventory import FinishedProduct
                    product = self.db.query(FinishedProduct).filter(FinishedProduct.id == item.product_id).first()
                    if product:
                        product.current_stock += int(recv.pass_quantity)
        order.status = "inspecting"
        all_received = all(
            i.received_quantity >= i.quantity
            for i in self.db.query(PurchaseOrderItem).filter(PurchaseOrderItem.order_id == order_id).all()
        )
        if all_received:
            order.status = "received"
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

    # === Purchase Returns ===
    def create_return(self, data, user_id):
        return_no = f"RET-{uuid.uuid4().hex[:16].upper()}"
        ret = PurchaseReturn(
            return_no=return_no, order_id=data.order_id,
            supplier_id=data.supplier_id, reason=data.reason, status="pending"
        )
        self.db.add(ret)
        self.db.flush()
        for item_data in data.items:
            ret_item = PurchaseReturnItem(return_id=ret.id, **item_data.model_dump())
            self.db.add(ret_item)
            order_item = self.db.query(PurchaseOrderItem).filter(PurchaseOrderItem.id == item_data.order_item_id).first()
            if order_item:
                order_item.received_quantity -= Decimal(str(item_data.quantity))
        self.db.commit()
        self.db.refresh(ret)
        return ret

    def complete_return(self, return_id):
        ret = self.db.query(PurchaseReturn).filter(PurchaseReturn.id == return_id).first()
        if not ret:
            return None
        ret.status = "completed"
        self.db.commit()
        self.db.refresh(ret)
        return ret

    def list_returns(self, skip=0, limit=100, order_id=None):
        q = self.db.query(PurchaseReturn)
        if order_id:
            q = q.filter(PurchaseReturn.order_id == order_id)
        return q.order_by(PurchaseReturn.created_at.desc()).offset(skip).limit(limit).all()

    def get_return_detail(self, id):
        ret = self.db.query(PurchaseReturn).filter(PurchaseReturn.id == id).first()
        if ret:
            ret.items = self.db.query(PurchaseReturnItem).filter(PurchaseReturnItem.return_id == id).all()
        return ret

    # === Departments ===
    def list_departments(self, skip=0, limit=100):
        return self.db.query(Department).offset(skip).limit(limit).all()

    def search_departments(self, q: str, limit: int = 20):
        from sqlalchemy import or_
        return self.db.query(Department).filter(
            or_(Department.name.ilike(f"%{q}%"), Department.code.ilike(f"%{q}%"))
        ).limit(limit).all()

    def create_department(self, data):
        d = Department(**data.model_dump())
        if not d.code:
            d.code = f"DEPT-{uuid.uuid4().hex[:8].upper()}"
        self.db.add(d)
        self.db.commit()
        self.db.refresh(d)
        return d

    def delete_department(self, id):
        d = self.db.query(Department).filter(Department.id == id).first()
        if not d:
            return False
        self.db.delete(d)
        self.db.commit()
        return True

    # === Warehouses ===
    def list_warehouses(self, skip=0, limit=100):
        return self.db.query(Warehouse).offset(skip).limit(limit).all()

    def search_warehouses(self, q: str, limit: int = 20):
        from sqlalchemy import or_
        return self.db.query(Warehouse).filter(
            or_(Warehouse.name.ilike(f"%{q}%"), Warehouse.code.ilike(f"%{q}%"))
        ).limit(limit).all()

    def create_warehouse(self, data):
        w = Warehouse(**data.model_dump())
        if not w.code:
            w.code = f"WH-{uuid.uuid4().hex[:8].upper()}"
        self.db.add(w)
        self.db.commit()
        self.db.refresh(w)
        return w

    def delete_warehouse(self, id):
        w = self.db.query(Warehouse).filter(Warehouse.id == id).first()
        if not w:
            return False
        self.db.delete(w)
        self.db.commit()
        return True
