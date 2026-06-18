from sqlalchemy.orm import Session

from app.models.customer import Customer, Contact, FollowUp
from app.schemas.customer import CustomerCreate, CustomerUpdate, ContactCreate, FollowUpCreate


class CustomerService:
    def __init__(self, db: Session):
        self.db = db

    def list_customers(self, skip: int = 0, limit: int = 100, status: str | None = None):
        query = self.db.query(Customer)
        if status:
            query = query.filter(Customer.status == status)
        return query.offset(skip).limit(limit).all()

    def get_customer(self, customer_id: int):
        return self.db.query(Customer).filter(Customer.id == customer_id).first()

    def create_customer(self, data: CustomerCreate):
        customer = Customer(**data.model_dump())
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def update_customer(self, customer_id: int, data: CustomerUpdate):
        customer = self.get_customer(customer_id)
        if not customer:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(customer, key, value)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def delete_customer(self, customer_id: int):
        customer = self.get_customer(customer_id)
        if not customer:
            return False
        self.db.delete(customer)
        self.db.commit()
        return True

    def add_contact(self, customer_id: int, data: ContactCreate):
        contact = Contact(customer_id=customer_id, **data.model_dump())
        self.db.add(contact)
        self.db.commit()
        self.db.refresh(contact)
        return contact

    def add_follow_up(self, customer_id: int, data: FollowUpCreate):
        follow_up = FollowUp(customer_id=customer_id, **data.model_dump())
        self.db.add(follow_up)
        self.db.commit()
        self.db.refresh(follow_up)
        return follow_up
