from sqlalchemy import Column, String, Integer, ForeignKey, Boolean, Text, DateTime
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Customer(BaseModel):
    __tablename__ = "customers"

    name = Column(String(200), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    level = Column(String(20), default="normal")
    source = Column(String(50))
    country = Column(String(100))
    email = Column(String(100))
    phone = Column(String(50))
    address = Column(Text)
    status = Column(String(20), default="active")

    contacts = relationship("Contact", back_populates="customer", cascade="all, delete-orphan")
    follow_ups = relationship("FollowUp", back_populates="customer", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="customer")


class Contact(BaseModel):
    __tablename__ = "contacts"

    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    name = Column(String(100), nullable=False)
    position = Column(String(100))
    phone = Column(String(50))
    email = Column(String(100))
    is_primary = Column(Boolean, default=False)

    customer = relationship("Customer", back_populates="contacts")


class FollowUp(BaseModel):
    __tablename__ = "follow_ups"

    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.id"))
    type = Column(String(50))
    content = Column(Text)
    next_follow_date = Column(DateTime)

    customer = relationship("Customer", back_populates="follow_ups")
    contact = relationship("Contact")
