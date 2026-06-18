import uuid
from decimal import Decimal
from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderUpdate


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
        order_no = f"ORD-{uuid.uuid4().hex[:8].upper()}"
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
        order = self.get_order(order_id)
        if not order:
            return None
        order.status = status
        self.db.commit()
        self.db.refresh(order)
        return order
