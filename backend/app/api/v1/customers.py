from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.schemas.customer import (
    CustomerCreate, CustomerUpdate, CustomerResponse, CustomerDetailResponse,
    ContactCreate, ContactResponse, FollowUpCreate, FollowUpResponse
)
from app.services.customer_service import CustomerService

router = APIRouter()


@router.get("/", response_model=list[CustomerResponse])
def list_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: str | None = None,
    db: Session = Depends(get_db_session)
):
    service = CustomerService(db)
    return service.list_customers(skip=skip, limit=limit, status=status)


@router.get("/{customer_id}", response_model=CustomerDetailResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db_session)):
    service = CustomerService(db)
    customer = service.get_customer(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("/", response_model=CustomerResponse)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db_session)):
    service = CustomerService(db)
    return service.create_customer(data)


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, data: CustomerUpdate, db: Session = Depends(get_db_session)):
    service = CustomerService(db)
    customer = service.update_customer(customer_id, data)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db_session)):
    service = CustomerService(db)
    if not service.delete_customer(customer_id):
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted"}


@router.post("/{customer_id}/contacts", response_model=ContactResponse)
def add_contact(customer_id: int, data: ContactCreate, db: Session = Depends(get_db_session)):
    service = CustomerService(db)
    return service.add_contact(customer_id, data)


@router.post("/{customer_id}/follow-ups", response_model=FollowUpResponse)
def add_follow_up(customer_id: int, data: FollowUpCreate, db: Session = Depends(get_db_session)):
    service = CustomerService(db)
    return service.add_follow_up(customer_id, data)
