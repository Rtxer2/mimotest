import uuid
from decimal import Decimal
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderUpdate
from app.services.approval_service import ApprovalService
from app.services.notification_service import NotificationService

ALLOWED_ORDER_STATUSES = ["pending", "pending_approval", "confirmed", "production", "quality", "packaging", "shipping", "completed", "cancelled"]


class OrderService:
    def __init__(self, db: Session):
        self.db = db

    def list_orders(self, skip: int = 0, limit: int = 100, customer_id: int | None = None, status: str | None = None):
        query = self.db.query(Order)
        if customer_id:
            query = query.filter(Order.customer_id == customer_id)
        if status:
            query = query.filter(Order.status == status)
        return query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    def get_order(self, order_id: int):
        return self.db.query(Order).filter(Order.id == order_id).first()

    def create_order(self, data: OrderCreate):
        customer = self.db.query(Customer).filter(Customer.id == data.customer_id).first()
        if not customer:
            raise ValueError(f"Customer {data.customer_id} not found")
        order_no = f"ORD-{uuid.uuid4().hex[:16].upper()}"
        total_amount = sum(
            (item.quantity * (item.unit_price or Decimal("0")))
            for item in data.items
        )
        order = Order(
            order_no=order_no,
            customer_id=data.customer_id,
            total_amount=total_amount,
            delivery_date=data.delivery_date,
            remarks=data.remarks,
        )
        self.db.add(order)
        self.db.flush()

        for item_data in data.items:
            item = OrderItem(order_id=order.id, **item_data.model_dump())
            self.db.add(item)

        self.db.commit()
        self.db.refresh(order)

        notification_service = NotificationService(self.db)
        notification_service.create_notification(
            event_type="order_created",
            title=f"新订单: {order.order_no}",
            content=f"客户 {order.customer.name} 创建了新订单 {order.order_no}",
            link=f"/orders/{order.id}",
            notification_type="order"
        )

        approval_service = ApprovalService(self.db)
        context = {"min_amount": float(order.total_amount) if order.total_amount else 0}
        flow = approval_service.find_matching_flow("order", context)
        if flow:
            instance = approval_service.create_instance(
                flow_id=flow.id,
                business_type="order",
                business_id=order.id,
                initiator_id=order.customer_id
            )
            order.status = "pending_approval"
            self.db.commit()
            self.db.refresh(order)

        return order

    def update_order(self, order_id: int, data: OrderUpdate):
        order = self.get_order(order_id)
        if not order:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(order, key, value)
        self.db.commit()
        self.db.refresh(order)
        return order

    def update_status(self, order_id: int, status: str):
        if status not in ALLOWED_ORDER_STATUSES:
            raise ValueError(f"Invalid status: {status}. Allowed: {ALLOWED_ORDER_STATUSES}")
        order = self.get_order(order_id)
        if not order:
            return None
        order.status = status
        self.db.commit()
        self.db.refresh(order)

        notification_service = NotificationService(self.db)
        notification_service.create_notification(
            event_type="order_status_changed",
            title=f"订单状态变更: {order.order_no}",
            content=f"订单 {order.order_no} 状态变更为 {status}",
            link=f"/orders/{order.id}",
            notification_type="order"
        )

        return order
