# ERP System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modular monolith ERP system with FastAPI backend, React frontend, and PostgreSQL database, covering customer management, orders, production, inventory, and quality modules.

**Architecture:** Modular monolith with clear separation between API, service, and data layers. Frontend uses React with Ant Design components and Zustand for state management.

**Tech Stack:** Python FastAPI, React 18, Ant Design 5, PostgreSQL 15, SQLAlchemy 2, Alembic, Zustand, Axios, JWT authentication

---

## File Structure

### Backend Files
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── customer.py
│   │   ├── order.py
│   │   ├── production.py
│   │   ├── inventory.py
│   │   └── quality.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── customer.py
│   │   ├── order.py
│   │   ├── production.py
│   │   ├── inventory.py
│   │   └── quality.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── customers.py
│   │       ├── orders.py
│   │       ├── production.py
│   │       ├── inventory.py
│   │       └── quality.py
│   └── services/
│       ├── __init__.py
│       ├── customer_service.py
│       ├── order_service.py
│       ├── production_service.py
│       ├── inventory_service.py
│       └── quality_service.py
├── alembic/
│   ├── env.py
│   └── versions/
├── alembic.ini
├── requirements.txt
├── Dockerfile
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── test_customers.py
    ├── test_orders.py
    ├── test_production.py
    ├── test_inventory.py
    └── test_quality.py
```

### Frontend Files
```
frontend/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── Dockerfile
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── vite-env.d.ts
    ├── api/
    │   ├── client.ts
    │   ├── customers.ts
    │   ├── orders.ts
    │   ├── production.ts
    │   ├── inventory.ts
    │   └── quality.ts
    ├── components/
    │   ├── Layout.tsx
    │   ├── Sidebar.tsx
    │   └── ProtectedRoute.tsx
    ├── pages/
    │   ├── Dashboard.tsx
    │   ├── Login.tsx
    │   ├── customers/
    │   │   ├── CustomerList.tsx
    │   │   └── CustomerDetail.tsx
    │   ├── orders/
    │   │   ├── OrderList.tsx
    │   │   ├── OrderDetail.tsx
    │   │   └── CreateOrder.tsx
    │   ├── production/
    │   │   ├── Dashboard.tsx
    │   │   ├── OrderList.tsx
    │   │   └── OrderDetail.tsx
    │   ├── inventory/
    │   │   ├── MaterialList.tsx
    │   │   └── ProductList.tsx
    │   └── quality/
    │       ├── InspectionList.tsx
    │       └── IssueList.tsx
    ├── store/
    │   ├── authStore.ts
    │   ├── customerStore.ts
    │   └── orderStore.ts
    └── utils/
        └── helpers.ts
```

### Root Files
```
docker-compose.yml
README.md
.env.example
```

---

## Task 1: Project Initialization and Docker Setup

**Covers:** S1

**Files:**
- Create: `docker-compose.yml`
- Create: `backend/Dockerfile`
- Create: `frontend/Dockerfile`
- Create: `.env.example`
- Create: `README.md`

- [ ] **Step 1: Create docker-compose.yml**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: erp_user
      POSTGRES_PASSWORD: erp_password
      POSTGRES_DB: erp_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://erp_user:erp_password@postgres:5432/erp_db
      SECRET_KEY: your-secret-key-change-in-production
    depends_on:
      - postgres
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
```

- [ ] **Step 2: Create backend/Dockerfile**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

- [ ] **Step 3: Create frontend/Dockerfile**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

- [ ] **Step 4: Create .env.example**

```env
DATABASE_URL=postgresql://erp_user:erp_password@localhost:5432/erp_db
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

- [ ] **Step 5: Create README.md**

```markdown
# ERP System

Enterprise production tracking and customer management system.

## Tech Stack
- Backend: Python FastAPI
- Frontend: React + Ant Design
- Database: PostgreSQL
- Containerization: Docker

## Quick Start
1. Copy `.env.example` to `.env`
2. Run `docker-compose up -d`
3. Access frontend at http://localhost:3000
4. Access API docs at http://localhost:8000/docs

## Development
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Database: localhost:5432
```

- [ ] **Step 6: Commit**

```bash
git add docker-compose.yml backend/Dockerfile frontend/Dockerfile .env.example README.md
git commit -m "feat: initialize project with Docker setup"
```

---

## Task 2: Backend Core Configuration

**Covers:** S1

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/app/__init__.py`
- Create: `backend/app/core/__init__.py`
- Create: `backend/app/core/config.py`
- Create: `backend/app/core/database.py`
- Create: `backend/app/core/security.py`

- [ ] **Step 1: Create requirements.txt**

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.13.0
psycopg2-binary==2.9.9
pydantic==2.5.2
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
httpx==0.25.2
pytest==7.4.3
pytest-asyncio==0.21.1
```

- [ ] **Step 2: Create app/__init__.py**

```python
```

- [ ] **Step 3: Create app/core/__init__.py**

```python
```

- [ ] **Step 4: Create app/core/config.py**

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://erp_user:erp_password@localhost:5432/erp_db"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"


settings = Settings()
```

- [ ] **Step 5: Create app/core/database.py**

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 6: Create app/core/security.py**

```python
from datetime import datetime, timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    from app.models.customer import Customer
    user = db.query(Customer).filter(Customer.email == username).first()
    if user is None:
        raise credentials_exception
    return user
```

- [ ] **Step 7: Commit**

```bash
git add backend/requirements.txt backend/app/__init__.py backend/app/core/
git commit -m "feat: add backend core configuration"
```

---

## Task 3: Database Models - Base and Customer

**Covers:** S2

**Files:**
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/base.py`
- Create: `backend/app/models/customer.py`

- [ ] **Step 1: Create models/__init__.py**

```python
from app.models.base import Base
from app.models.customer import Customer, Contact, FollowUp
from app.models.order import Order, OrderItem
from app.models.production import ProductionOrder, ProductionStage
from app.models.inventory import Material, FinishedProduct, StockTransaction
from app.models.quality import QualityInspection, QualityIssue

__all__ = [
    "Base",
    "Customer", "Contact", "FollowUp",
    "Order", "OrderItem",
    "ProductionOrder", "ProductionStage",
    "Material", "FinishedProduct", "StockTransaction",
    "QualityInspection", "QualityIssue",
]
```

- [ ] **Step 2: Create models/base.py**

```python
from datetime import datetime

from sqlalchemy import Column, Integer, DateTime
from app.core.database import Base


class BaseModel(Base):
    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

- [ ] **Step 3: Create models/customer.py**

```python
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
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/models/__init__.py backend/app/models/base.py backend/app/models/customer.py
git commit -m "feat: add base model and customer models"
```

---

## Task 4: Database Models - Order, Production, Inventory, Quality

**Covers:** S2

**Files:**
- Create: `backend/app/models/order.py`
- Create: `backend/app/models/production.py`
- Create: `backend/app/models/inventory.py`
- Create: `backend/app/models/quality.py`

- [ ] **Step 1: Create models/order.py**

```python
from sqlalchemy import Column, String, Integer, ForeignKey, Numeric, DateTime, Text
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Order(BaseModel):
    __tablename__ = "orders"

    order_no = Column(String(50), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    status = Column(String(20), default="pending")
    total_amount = Column(Numeric(12, 2))
    delivery_date = Column(DateTime)
    remarks = Column(Text)

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    production_order = relationship("ProductionOrder", back_populates="order", uselist=False)


class OrderItem(BaseModel):
    __tablename__ = "order_items"

    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_name = Column(String(200), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2))
    specs = Column(Text)

    order = relationship("Order", back_populates="items")
```

- [ ] **Step 2: Create models/production.py**

```python
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class ProductionOrder(BaseModel):
    __tablename__ = "production_orders"

    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    status = Column(String(20), default="pending")
    assigned_workshop = Column(String(100))
    planned_start = Column(DateTime)
    planned_end = Column(DateTime)
    remarks = Column(Text)

    order = relationship("Order", back_populates="production_order")
    stages = relationship("ProductionStage", back_populates="production_order", cascade="all, delete-orphan")


class ProductionStage(BaseModel):
    __tablename__ = "production_stages"

    production_order_id = Column(Integer, ForeignKey("production_orders.id"), nullable=False)
    stage_name = Column(String(100), nullable=False)
    status = Column(String(20), default="pending")
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    progress = Column(Float, default=0)
    remarks = Column(Text)

    production_order = relationship("ProductionOrder", back_populates="stages")
```

- [ ] **Step 3: Create models/inventory.py**

```python
from sqlalchemy import Column, String, Integer, Numeric, DateTime, Text
from app.models.base import BaseModel


class Material(BaseModel):
    __tablename__ = "materials"

    name = Column(String(200), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    unit = Column(String(20), nullable=False)
    safety_stock = Column(Numeric(10, 2), default=0)
    current_stock = Column(Numeric(10, 2), default=0)


class FinishedProduct(BaseModel):
    __tablename__ = "finished_products"

    product_name = Column(String(200), nullable=False)
    sku = Column(String(50), unique=True, nullable=False)
    current_stock = Column(Integer, default=0)
    safety_stock = Column(Integer, default=0)


class StockTransaction(BaseModel):
    __tablename__ = "stock_transactions"

    item_type = Column(String(20), nullable=False)
    item_id = Column(Integer, nullable=False)
    transaction_type = Column(String(20), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    reason = Column(Text)
    transaction_date = Column(DateTime)
```

- [ ] **Step 4: Create models/quality.py**

```python
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class QualityInspection(BaseModel):
    __tablename__ = "quality_inspections"

    inspection_type = Column(String(50), nullable=False)
    item_id = Column(Integer, nullable=False)
    result = Column(String(20), nullable=False)
    inspector = Column(String(100))
    inspect_time = Column(DateTime)
    remarks = Column(Text)

    issues = relationship("QualityIssue", back_populates="inspection", cascade="all, delete-orphan")


class QualityIssue(BaseModel):
    __tablename__ = "quality_issues"

    inspection_id = Column(Integer, ForeignKey("quality_inspections.id"), nullable=False)
    issue_type = Column(String(50), nullable=False)
    description = Column(Text)
    status = Column(String(20), default="open")

    inspection = relationship("QualityInspection", back_populates="issues")
```

- [ ] **Step 5: Commit**

```bash
git add backend/app/models/order.py backend/app/models/production.py backend/app/models/inventory.py backend/app/models/quality.py
git commit -m "feat: add order, production, inventory, and quality models"
```

---

## Task 5: Pydantic Schemas

**Covers:** S2, S3

**Files:**
- Create: `backend/app/schemas/__init__.py`
- Create: `backend/app/schemas/customer.py`
- Create: `backend/app/schemas/order.py`
- Create: `backend/app/schemas/production.py`
- Create: `backend/app/schemas/inventory.py`
- Create: `backend/app/schemas/quality.py`

- [ ] **Step 1: Create schemas/__init__.py**

```python
```

- [ ] **Step 2: Create schemas/customer.py**

```python
from datetime import datetime
from pydantic import BaseModel, EmailStr


class ContactBase(BaseModel):
    name: str
    position: str | None = None
    phone: str | None = None
    email: str | None = None
    is_primary: bool = False


class ContactCreate(ContactBase):
    pass


class ContactResponse(ContactBase):
    id: int
    customer_id: int

    class Config:
        from_attributes = True


class FollowUpBase(BaseModel):
    contact_id: int | None = None
    type: str
    content: str
    next_follow_date: datetime | None = None


class FollowUpCreate(FollowUpBase):
    pass


class FollowUpResponse(FollowUpBase):
    id: int
    customer_id: int

    class Config:
        from_attributes = True


class CustomerBase(BaseModel):
    name: str
    code: str
    level: str = "normal"
    source: str | None = None
    country: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: str | None = None
    level: str | None = None
    source: str | None = None
    country: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    status: str | None = None


class CustomerResponse(CustomerBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CustomerDetailResponse(CustomerResponse):
    contacts: list[ContactResponse] = []
    follow_ups: list[FollowUpResponse] = []
```

- [ ] **Step 3: Create schemas/order.py**

```python
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class OrderItemBase(BaseModel):
    product_name: str
    quantity: int
    unit_price: Decimal | None = None
    specs: str | None = None


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    customer_id: int
    delivery_date: datetime | None = None
    remarks: str | None = None


class OrderCreate(OrderBase):
    items: list[OrderItemCreate]


class OrderUpdate(BaseModel):
    delivery_date: datetime | None = None
    remarks: str | None = None
    status: str | None = None


class OrderResponse(OrderBase):
    id: int
    order_no: str
    status: str
    total_amount: Decimal | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderDetailResponse(OrderResponse):
    items: list[OrderItemResponse] = []
```

- [ ] **Step 4: Create schemas/production.py**

```python
from datetime import datetime
from pydantic import BaseModel


class ProductionStageBase(BaseModel):
    stage_name: str
    status: str = "pending"
    start_time: datetime | None = None
    end_time: datetime | None = None
    progress: float = 0
    remarks: str | None = None


class ProductionStageCreate(ProductionStageBase):
    pass


class ProductionStageResponse(ProductionStageBase):
    id: int
    production_order_id: int

    class Config:
        from_attributes = True


class ProductionOrderBase(BaseModel):
    order_id: int
    assigned_workshop: str | None = None
    planned_start: datetime | None = None
    planned_end: datetime | None = None
    remarks: str | None = None


class ProductionOrderCreate(ProductionOrderBase):
    stages: list[ProductionStageCreate]


class ProductionOrderUpdate(BaseModel):
    status: str | None = None
    assigned_workshop: str | None = None
    planned_start: datetime | None = None
    planned_end: datetime | None = None
    remarks: str | None = None


class ProductionOrderResponse(ProductionOrderBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProductionOrderDetailResponse(ProductionOrderResponse):
    stages: list[ProductionStageResponse] = []


class ProductionDashboard(BaseModel):
    total_orders: int
    in_progress: int
    completed: int
    delayed: int
```

- [ ] **Step 5: Create schemas/inventory.py**

```python
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class MaterialBase(BaseModel):
    name: str
    code: str
    unit: str
    safety_stock: Decimal = 0


class MaterialCreate(MaterialBase):
    pass


class MaterialUpdate(BaseModel):
    name: str | None = None
    unit: str | None = None
    safety_stock: Decimal | None = None


class MaterialResponse(MaterialBase):
    id: int
    current_stock: Decimal

    class Config:
        from_attributes = True


class FinishedProductBase(BaseModel):
    product_name: str
    sku: str
    safety_stock: int = 0


class FinishedProductCreate(FinishedProductBase):
    pass


class FinishedProductUpdate(BaseModel):
    product_name: str | None = None
    safety_stock: int | None = None


class FinishedProductResponse(FinishedProductBase):
    id: int
    current_stock: int

    class Config:
        from_attributes = True


class StockTransactionBase(BaseModel):
    item_type: str
    item_id: int
    transaction_type: str
    quantity: Decimal
    reason: str | None = None


class StockTransactionCreate(StockTransactionBase):
    pass


class StockTransactionResponse(StockTransactionBase):
    id: int
    transaction_date: datetime

    class Config:
        from_attributes = True
```

- [ ] **Step 6: Create schemas/quality.py**

```python
from datetime import datetime
from pydantic import BaseModel


class QualityIssueBase(BaseModel):
    issue_type: str
    description: str | None = None
    status: str = "open"


class QualityIssueCreate(QualityIssueBase):
    pass


class QualityIssueResponse(QualityIssueBase):
    id: int
    inspection_id: int

    class Config:
        from_attributes = True


class QualityInspectionBase(BaseModel):
    inspection_type: str
    item_id: int
    result: str
    inspector: str | None = None
    inspect_time: datetime | None = None
    remarks: str | None = None


class QualityInspectionCreate(QualityInspectionBase):
    issues: list[QualityIssueCreate] = []


class QualityInspectionResponse(QualityInspectionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class QualityInspectionDetailResponse(QualityInspectionResponse):
    issues: list[QualityIssueResponse] = []
```

- [ ] **Step 7: Commit**

```bash
git add backend/app/schemas/
git commit -m "feat: add Pydantic schemas for all modules"
```

---

## Task 6: API Dependencies and Router Setup

**Covers:** S3

**Files:**
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/deps.py`
- Create: `backend/app/api/v1/__init__.py`

- [ ] **Step 1: Create api/__init__.py**

```python
```

- [ ] **Step 2: Create api/deps.py**

```python
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.customer import Customer


async def get_current_active_user(current_user: Customer = Depends(get_current_user)):
    if current_user.status != "active":
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_db_session(db: Session = Depends(get_db)):
    return db
```

- [ ] **Step 3: Create api/v1/__init__.py**

```python
from fastapi import APIRouter

from app.api.v1 import customers, orders, production, inventory, quality

api_router = APIRouter()

api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(production.router, prefix="/production", tags=["production"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(quality.router, prefix="/quality", tags=["quality"])
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/api/
git commit -m "feat: add API dependencies and router setup"
```

---

## Task 7: Customer Service and API

**Covers:** S2, S3

**Files:**
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/customer_service.py`
- Create: `backend/app/api/v1/customers.py`

- [ ] **Step 1: Create services/__init__.py**

```python
```

- [ ] **Step 2: Create services/customer_service.py**

```python
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
```

- [ ] **Step 3: Create api/v1/customers.py**

```python
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
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/services/__init__.py backend/app/services/customer_service.py backend/app/api/v1/customers.py
git commit -m "feat: add customer service and API endpoints"
```

---

## Task 8: Order Service and API

**Covers:** S2, S3

**Files:**
- Create: `backend/app/services/order_service.py`
- Create: `backend/app/api/v1/orders.py`

- [ ] **Step 1: Create services/order_service.py**

```python
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
```

- [ ] **Step 2: Create api/v1/orders.py**

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse, OrderDetailResponse
from app.services.order_service import OrderService

router = APIRouter()


@router.get("/", response_model=list[OrderResponse])
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    customer_id: int | None = None,
    status: str | None = None,
    db: Session = Depends(get_db_session)
):
    service = OrderService(db)
    return service.list_orders(skip=skip, limit=limit, customer_id=customer_id, status=status)


@router.get("/{order_id}", response_model=OrderDetailResponse)
def get_order(order_id: int, db: Session = Depends(get_db_session)):
    service = OrderService(db)
    order = service.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/", response_model=OrderResponse)
def create_order(data: OrderCreate, db: Session = Depends(get_db_session)):
    service = OrderService(db)
    return service.create_order(data)


@router.put("/{order_id}", response_model=OrderResponse)
def update_order(order_id: int, data: OrderUpdate, db: Session = Depends(get_db_session)):
    service = OrderService(db)
    order = service.update_order(order_id, data)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_status(order_id: int, status: str, db: Session = Depends(get_db_session)):
    service = OrderService(db)
    order = service.update_status(order_id, status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/services/order_service.py backend/app/api/v1/orders.py
git commit -m "feat: add order service and API endpoints"
```

---

## Task 9: Production Service and API

**Covers:** S2, S3

**Files:**
- Create: `backend/app/services/production_service.py`
- Create: `backend/app/api/v1/production.py`

- [ ] **Step 1: Create services/production_service.py**

```python
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.production import ProductionOrder, ProductionStage
from app.models.order import Order
from app.schemas.production import ProductionOrderCreate, ProductionOrderUpdate


class ProductionService:
    def __init__(self, db: Session):
        self.db = db

    def list_orders(self, skip: int = 0, limit: int = 100, status: str | None = None):
        query = self.db.query(ProductionOrder)
        if status:
            query = query.filter(ProductionOrder.status == status)
        return query.offset(skip).limit(limit).all()

    def get_order(self, order_id: int):
        return self.db.query(ProductionOrder).filter(ProductionOrder.id == order_id).first()

    def create_order(self, data: ProductionOrderCreate):
        prod_order = ProductionOrder(
            order_id=data.order_id,
            assigned_workshop=data.assigned_workshop,
            planned_start=data.planned_start,
            planned_end=data.planned_end,
            remarks=data.remarks,
        )
        self.db.add(prod_order)
        self.db.flush()

        for stage_data in data.stages:
            stage = ProductionStage(production_order_id=prod_order.id, **stage_data.model_dump())
            self.db.add(stage)

        self.db.commit()
        self.db.refresh(prod_order)
        return prod_order

    def update_order(self, order_id: int, data: ProductionOrderUpdate):
        order = self.get_order(order_id)
        if not order:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(order, key, value)
        self.db.commit()
        self.db.refresh(order)
        return order

    def update_stage(self, stage_id: int, status: str, progress: float | None = None):
        stage = self.db.query(ProductionStage).filter(ProductionStage.id == stage_id).first()
        if not stage:
            return None
        stage.status = status
        if progress is not None:
            stage.progress = progress
        if status == "in_progress" and not stage.start_time:
            stage.start_time = datetime.utcnow()
        elif status == "completed":
            stage.end_time = datetime.utcnow()
            stage.progress = 100
        self.db.commit()
        self.db.refresh(stage)
        return stage

    def get_dashboard(self):
        total = self.db.query(func.count(ProductionOrder.id)).scalar()
        in_progress = self.db.query(func.count(ProductionOrder.id)).filter(
            ProductionOrder.status == "in_progress"
        ).scalar()
        completed = self.db.query(func.count(ProductionOrder.id)).filter(
            ProductionOrder.status == "completed"
        ).scalar()
        delayed = self.db.query(func.count(ProductionOrder.id)).filter(
            ProductionOrder.planned_end < datetime.utcnow(),
            ProductionOrder.status != "completed"
        ).scalar()

        return {
            "total_orders": total,
            "in_progress": in_progress,
            "completed": completed,
            "delayed": delayed,
        }
```

- [ ] **Step 2: Create api/v1/production.py**

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.schemas.production import (
    ProductionOrderCreate, ProductionOrderUpdate,
    ProductionOrderResponse, ProductionOrderDetailResponse, ProductionDashboard
)
from app.services.production_service import ProductionService

router = APIRouter()


@router.get("/dashboard", response_model=ProductionDashboard)
def get_dashboard(db: Session = Depends(get_db_session)):
    service = ProductionService(db)
    return service.get_dashboard()


@router.get("/orders", response_model=list[ProductionOrderResponse])
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: str | None = None,
    db: Session = Depends(get_db_session)
):
    service = ProductionService(db)
    return service.list_orders(skip=skip, limit=limit, status=status)


@router.get("/orders/{order_id}", response_model=ProductionOrderDetailResponse)
def get_order(order_id: int, db: Session = Depends(get_db_session)):
    service = ProductionService(db)
    order = service.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Production order not found")
    return order


@router.post("/orders", response_model=ProductionOrderResponse)
def create_order(data: ProductionOrderCreate, db: Session = Depends(get_db_session)):
    service = ProductionService(db)
    return service.create_order(data)


@router.put("/orders/{order_id}", response_model=ProductionOrderResponse)
def update_order(order_id: int, data: ProductionOrderUpdate, db: Session = Depends(get_db_session)):
    service = ProductionService(db)
    order = service.update_order(order_id, data)
    if not order:
        raise HTTPException(status_code=404, detail="Production order not found")
    return order


@router.put("/stages/{stage_id}")
def update_stage(stage_id: int, status: str, progress: float | None = None, db: Session = Depends(get_db_session)):
    service = ProductionService(db)
    stage = service.update_stage(stage_id, status, progress)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    return stage
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/services/production_service.py backend/app/api/v1/production.py
git commit -m "feat: add production service and API endpoints"
```

---

## Task 10: Inventory Service and API

**Covers:** S2, S3

**Files:**
- Create: `backend/app/services/inventory_service.py`
- Create: `backend/app/api/v1/inventory.py`

- [ ] **Step 1: Create services/inventory_service.py**

```python
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session

from app.models.inventory import Material, FinishedProduct, StockTransaction
from app.schemas.inventory import (
    MaterialCreate, MaterialUpdate,
    FinishedProductCreate, FinishedProductUpdate,
    StockTransactionCreate
)


class InventoryService:
    def __init__(self, db: Session):
        self.db = db

    def list_materials(self, skip: int = 0, limit: int = 100):
        return self.db.query(Material).offset(skip).limit(limit).all()

    def get_material(self, material_id: int):
        return self.db.query(Material).filter(Material.id == material_id).first()

    def create_material(self, data: MaterialCreate):
        material = Material(**data.model_dump())
        self.db.add(material)
        self.db.commit()
        self.db.refresh(material)
        return material

    def update_material(self, material_id: int, data: MaterialUpdate):
        material = self.get_material(material_id)
        if not material:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(material, key, value)
        self.db.commit()
        self.db.refresh(material)
        return material

    def list_products(self, skip: int = 0, limit: int = 100):
        return self.db.query(FinishedProduct).offset(skip).limit(limit).all()

    def get_product(self, product_id: int):
        return self.db.query(FinishedProduct).filter(FinishedProduct.id == product_id).first()

    def create_product(self, data: FinishedProductCreate):
        product = FinishedProduct(**data.model_dump())
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def update_product(self, product_id: int, data: FinishedProductUpdate):
        product = self.get_product(product_id)
        if not product:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(product, key, value)
        self.db.commit()
        self.db.refresh(product)
        return product

    def create_transaction(self, data: StockTransactionCreate):
        transaction = StockTransaction(**data.model_dump(), transaction_date=datetime.utcnow())
        self.db.add(transaction)

        if data.item_type == "material":
            material = self.get_material(data.item_id)
            if material:
                if data.transaction_type == "in":
                    material.current_stock += data.quantity
                else:
                    material.current_stock -= data.quantity
        elif data.item_type == "product":
            product = self.get_product(data.item_id)
            if product:
                if data.transaction_type == "in":
                    product.current_stock += int(data.quantity)
                else:
                    product.current_stock -= int(data.quantity)

        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def list_transactions(self, item_type: str | None = None, item_id: int | None = None, skip: int = 0, limit: int = 100):
        query = self.db.query(StockTransaction)
        if item_type:
            query = query.filter(StockTransaction.item_type == item_type)
        if item_id:
            query = query.filter(StockTransaction.item_id == item_id)
        return query.order_by(StockTransaction.transaction_date.desc()).offset(skip).limit(limit).all()
```

- [ ] **Step 2: Create api/v1/inventory.py**

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.schemas.inventory import (
    MaterialCreate, MaterialUpdate, MaterialResponse,
    FinishedProductCreate, FinishedProductUpdate, FinishedProductResponse,
    StockTransactionCreate, StockTransactionResponse
)
from app.services.inventory_service import InventoryService

router = APIRouter()


@router.get("/materials", response_model=list[MaterialResponse])
def list_materials(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    return service.list_materials(skip=skip, limit=limit)


@router.get("/materials/{material_id}", response_model=MaterialResponse)
def get_material(material_id: int, db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    material = service.get_material(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material


@router.post("/materials", response_model=MaterialResponse)
def create_material(data: MaterialCreate, db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    return service.create_material(data)


@router.put("/materials/{material_id}", response_model=MaterialResponse)
def update_material(material_id: int, data: MaterialUpdate, db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    material = service.update_material(material_id, data)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material


@router.get("/products", response_model=list[FinishedProductResponse])
def list_products(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=100), db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    return service.list_products(skip=skip, limit=limit)


@router.get("/products/{product_id}", response_model=FinishedProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    product = service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/products", response_model=FinishedProductResponse)
def create_product(data: FinishedProductCreate, db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    return service.create_product(data)


@router.put("/products/{product_id}", response_model=FinishedProductResponse)
def update_product(product_id: int, data: FinishedProductUpdate, db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    product = service.update_product(product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/transactions", response_model=StockTransactionResponse)
def create_transaction(data: StockTransactionCreate, db: Session = Depends(get_db_session)):
    service = InventoryService(db)
    return service.create_transaction(data)


@router.get("/transactions", response_model=list[StockTransactionResponse])
def list_transactions(
    item_type: str | None = None,
    item_id: int | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db_session)
):
    service = InventoryService(db)
    return service.list_transactions(item_type=item_type, item_id=item_id, skip=skip, limit=limit)
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/services/inventory_service.py backend/app/api/v1/inventory.py
git commit -m "feat: add inventory service and API endpoints"
```

---

## Task 11: Quality Service and API

**Covers:** S2, S3

**Files:**
- Create: `backend/app/services/quality_service.py`
- Create: `backend/app/api/v1/quality.py`

- [ ] **Step 1: Create services/quality_service.py**

```python
from sqlalchemy.orm import Session

from app.models.quality import QualityInspection, QualityIssue
from app.schemas.quality import QualityInspectionCreate


class QualityService:
    def __init__(self, db: Session):
        self.db = db

    def list_inspections(self, skip: int = 0, limit: int = 100, inspection_type: str | None = None):
        query = self.db.query(QualityInspection)
        if inspection_type:
            query = query.filter(QualityInspection.inspection_type == inspection_type)
        return query.order_by(QualityInspection.created_at.desc()).offset(skip).limit(limit).all()

    def get_inspection(self, inspection_id: int):
        return self.db.query(QualityInspection).filter(QualityInspection.id == inspection_id).first()

    def create_inspection(self, data: QualityInspectionCreate):
        inspection = QualityInspection(
            inspection_type=data.inspection_type,
            item_id=data.item_id,
            result=data.result,
            inspector=data.inspector,
            inspect_time=data.inspect_time,
            remarks=data.remarks,
        )
        self.db.add(inspection)
        self.db.flush()

        for issue_data in data.issues:
            issue = QualityIssue(inspection_id=inspection.id, **issue_data.model_dump())
            self.db.add(issue)

        self.db.commit()
        self.db.refresh(inspection)
        return inspection

    def list_issues(self, skip: int = 0, limit: int = 100, status: str | None = None):
        query = self.db.query(QualityIssue)
        if status:
            query = query.filter(QualityIssue.status == status)
        return query.offset(skip).limit(limit).all()

    def update_issue(self, issue_id: int, status: str):
        issue = self.db.query(QualityIssue).filter(QualityIssue.id == issue_id).first()
        if not issue:
            return None
        issue.status = status
        self.db.commit()
        self.db.refresh(issue)
        return issue
```

- [ ] **Step 2: Create api/v1/quality.py**

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db_session
from app.schemas.quality import (
    QualityInspectionCreate, QualityInspectionResponse, QualityInspectionDetailResponse,
    QualityIssueResponse
)
from app.services.quality_service import QualityService

router = APIRouter()


@router.get("/inspections", response_model=list[QualityInspectionResponse])
def list_inspections(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    inspection_type: str | None = None,
    db: Session = Depends(get_db_session)
):
    service = QualityService(db)
    return service.list_inspections(skip=skip, limit=limit, inspection_type=inspection_type)


@router.get("/inspections/{inspection_id}", response_model=QualityInspectionDetailResponse)
def get_inspection(inspection_id: int, db: Session = Depends(get_db_session)):
    service = QualityService(db)
    inspection = service.get_inspection(inspection_id)
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return inspection


@router.post("/inspections", response_model=QualityInspectionResponse)
def create_inspection(data: QualityInspectionCreate, db: Session = Depends(get_db_session)):
    service = QualityService(db)
    return service.create_inspection(data)


@router.get("/issues", response_model=list[QualityIssueResponse])
def list_issues(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: str | None = None,
    db: Session = Depends(get_db_session)
):
    service = QualityService(db)
    return service.list_issues(skip=skip, limit=limit, status=status)


@router.put("/issues/{issue_id}", response_model=QualityIssueResponse)
def update_issue(issue_id: int, status: str, db: Session = Depends(get_db_session)):
    service = QualityService(db)
    issue = service.update_issue(issue_id, status)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/services/quality_service.py backend/app/api/v1/quality.py
git commit -m "feat: add quality service and API endpoints"
```

---

## Task 12: Main Application Entry

**Covers:** S1, S3

**Files:**
- Create: `backend/app/main.py`

- [ ] **Step 1: Create app/main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router

app = FastAPI(
    title="ERP System",
    description="Enterprise production tracking and customer management system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "ERP System API"}


@app.get("/health")
def health():
    return {"status": "healthy"}
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/main.py
git commit -m "feat: add main application entry point"
```

---

## Task 13: Alembic Database Migration Setup

**Covers:** S1

**Files:**
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`
- Create: `backend/alembic/script.py.mako`

- [ ] **Step 1: Initialize Alembic**

Run: `cd backend && alembic init alembic`

- [ ] **Step 2: Update alembic.ini**

Update sqlalchemy.url in alembic.ini:
```ini
sqlalchemy.url = postgresql://erp_user:erp_password@localhost:5432/erp_db
```

- [ ] **Step 3: Update alembic/env.py**

```python
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

from app.core.database import Base
from app.models import *  # noqa

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

- [ ] **Step 4: Create initial migration**

Run: `cd backend && alembic revision --autogenerate -m "initial tables"`

- [ ] **Step 5: Apply migration**

Run: `cd backend && alembic upgrade head`

- [ ] **Step 6: Commit**

```bash
git add backend/alembic.ini backend/alembic/
git commit -m "feat: add Alembic database migration setup"
```

---

## Task 14: Frontend Project Setup

**Covers:** S1, S4

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/vite-env.d.ts`

- [ ] **Step 1: Initialize React project**

Run: `npm create vite@latest frontend -- --template react-ts`

- [ ] **Step 2: Install dependencies**

Run: `cd frontend && npm install antd @ant-design/icons axios zustand react-router-dom`

- [ ] **Step 3: Update package.json scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 4: Create src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 5: Commit**

```bash
git add frontend/
git commit -m "feat: initialize React frontend project"
```

---

## Task 15: Frontend API Client and Store

**Covers:** S4

**Files:**
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/customers.ts`
- Create: `frontend/src/api/orders.ts`
- Create: `frontend/src/api/production.ts`
- Create: `frontend/src/api/inventory.ts`
- Create: `frontend/src/api/quality.ts`
- Create: `frontend/src/store/authStore.ts`

- [ ] **Step 1: Create api/client.ts**

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
```

- [ ] **Step 2: Create api/customers.ts**

```typescript
import client from './client';

export interface Customer {
  id: number;
  name: string;
  code: string;
  level: string;
  source?: string;
  country?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  customer_id: number;
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  is_primary: boolean;
}

export interface FollowUp {
  id: number;
  customer_id: number;
  contact_id?: number;
  type: string;
  content: string;
  next_follow_date?: string;
}

export interface CustomerCreate {
  name: string;
  code: string;
  level?: string;
  source?: string;
  country?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const customerApi = {
  list: (params?: { skip?: number; limit?: number; status?: string }) =>
    client.get<Customer[]>('/customers', { params }),

  get: (id: number) =>
    client.get<Customer & { contacts: Contact[]; follow_ups: FollowUp[] }>(`/customers/${id}`),

  create: (data: CustomerCreate) =>
    client.post<Customer>('/customers', data),

  update: (id: number, data: Partial<CustomerCreate>) =>
    client.put<Customer>(`/customers/${id}`, data),

  delete: (id: number) =>
    client.delete(`/customers/${id}`),

  addContact: (customerId: number, data: Omit<Contact, 'id' | 'customer_id'>) =>
    client.post<Contact>(`/customers/${customerId}/contacts`, data),

  addFollowUp: (customerId: number, data: Omit<FollowUp, 'id' | 'customer_id'>) =>
    client.post<FollowUp>(`/customers/${customerId}/follow-ups`, data),
};
```

- [ ] **Step 3: Create api/orders.ts**

```typescript
import client from './client';

export interface OrderItem {
  id: number;
  order_id: number;
  product_name: string;
  quantity: number;
  unit_price?: number;
  specs?: string;
}

export interface Order {
  id: number;
  order_no: string;
  customer_id: number;
  status: string;
  total_amount?: number;
  delivery_date?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderCreate {
  customer_id: number;
  delivery_date?: string;
  remarks?: string;
  items: {
    product_name: string;
    quantity: number;
    unit_price?: number;
    specs?: string;
  }[];
}

export const orderApi = {
  list: (params?: { skip?: number; limit?: number; customer_id?: number; status?: string }) =>
    client.get<Order[]>('/orders', { params }),

  get: (id: number) =>
    client.get<Order & { items: OrderItem[] }>(`/orders/${id}`),

  create: (data: OrderCreate) =>
    client.post<Order>('/orders', data),

  update: (id: number, data: Partial<Order>) =>
    client.put<Order>(`/orders/${id}`, data),

  updateStatus: (id: number, status: string) =>
    client.put<Order>(`/orders/${id}/status`, null, { params: { status } }),
};
```

- [ ] **Step 4: Create api/production.ts**

```typescript
import client from './client';

export interface ProductionStage {
  id: number;
  production_order_id: number;
  stage_name: string;
  status: string;
  start_time?: string;
  end_time?: string;
  progress: number;
  remarks?: string;
}

export interface ProductionOrder {
  id: number;
  order_id: number;
  status: string;
  assigned_workshop?: string;
  planned_start?: string;
  planned_end?: string;
  remarks?: string;
  created_at: string;
}

export interface ProductionDashboard {
  total_orders: number;
  in_progress: number;
  completed: number;
  delayed: number;
}

export const productionApi = {
  dashboard: () =>
    client.get<ProductionDashboard>('/production/dashboard'),

  listOrders: (params?: { skip?: number; limit?: number; status?: string }) =>
    client.get<ProductionOrder[]>('/production/orders', { params }),

  getOrder: (id: number) =>
    client.get<ProductionOrder & { stages: ProductionStage[] }>(`/production/orders/${id}`),

  createOrder: (data: {
    order_id: number;
    assigned_workshop?: string;
    planned_start?: string;
    planned_end?: string;
    remarks?: string;
    stages: { stage_name: string }[];
  }) =>
    client.post<ProductionOrder>('/production/orders', data),

  updateStage: (stageId: number, status: string, progress?: number) =>
    client.put(`/production/stages/${stageId}`, null, { params: { status, progress } }),
};
```

- [ ] **Step 5: Create api/inventory.ts**

```typescript
import client from './client';

export interface Material {
  id: number;
  name: string;
  code: string;
  unit: string;
  safety_stock: number;
  current_stock: number;
}

export interface FinishedProduct {
  id: number;
  product_name: string;
  sku: string;
  current_stock: number;
  safety_stock: number;
}

export interface StockTransaction {
  id: number;
  item_type: string;
  item_id: number;
  transaction_type: string;
  quantity: number;
  reason?: string;
  transaction_date: string;
}

export const inventoryApi = {
  listMaterials: (params?: { skip?: number; limit?: number }) =>
    client.get<Material[]>('/inventory/materials', { params }),

  createMaterial: (data: Omit<Material, 'id' | 'current_stock'>) =>
    client.post<Material>('/inventory/materials', data),

  listProducts: (params?: { skip?: number; limit?: number }) =>
    client.get<FinishedProduct[]>('/inventory/products', { params }),

  createProduct: (data: Omit<FinishedProduct, 'id' | 'current_stock'>) =>
    client.post<FinishedProduct>('/inventory/products', data),

  createTransaction: (data: {
    item_type: string;
    item_id: number;
    transaction_type: string;
    quantity: number;
    reason?: string;
  }) =>
    client.post<StockTransaction>('/inventory/transactions', data),

  listTransactions: (params?: { item_type?: string; item_id?: number; skip?: number; limit?: number }) =>
    client.get<StockTransaction[]>('/inventory/transactions', { params }),
};
```

- [ ] **Step 6: Create api/quality.ts**

```typescript
import client from './client';

export interface QualityInspection {
  id: number;
  inspection_type: string;
  item_id: number;
  result: string;
  inspector?: string;
  inspect_time?: string;
  remarks?: string;
  created_at: string;
}

export interface QualityIssue {
  id: number;
  inspection_id: number;
  issue_type: string;
  description?: string;
  status: string;
}

export const qualityApi = {
  listInspections: (params?: { skip?: number; limit?: number; inspection_type?: string }) =>
    client.get<QualityInspection[]>('/quality/inspections', { params }),

  getInspection: (id: number) =>
    client.get<QualityInspection & { issues: QualityIssue[] }>(`/quality/inspections/${id}`),

  createInspection: (data: Omit<QualityInspection, 'id' | 'created_at'> & { issues?: { issue_type: string; description?: string }[] }) =>
    client.post<QualityInspection>('/quality/inspections', data),

  listIssues: (params?: { skip?: number; limit?: number; status?: string }) =>
    client.get<QualityIssue[]>('/quality/issues', { params }),

  updateIssue: (id: number, status: string) =>
    client.put<QualityIssue>(`/quality/issues/${id}`, null, { params: { status } }),
};
```

- [ ] **Step 7: Create store/authStore.ts**

```typescript
import { create } from 'zustand';
import client from '../api/client';

interface AuthState {
  token: string | null;
  user: any | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,

  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await client.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    set({ token: access_token });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },

  isAuthenticated: () => {
    return get().token !== null;
  },
}));
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/api/ frontend/src/store/
git commit -m "feat: add API client and auth store"
```

---

## Task 16: Frontend Layout and Routing

**Covers:** S4

**Files:**
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/components/Layout.tsx`
- Create: `frontend/src/components/Sidebar.tsx`
- Create: `frontend/src/components/ProtectedRoute.tsx`

- [ ] **Step 1: Create App.tsx**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import CustomerList from './pages/customers/CustomerList';
import CustomerDetail from './pages/customers/CustomerDetail';
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';
import CreateOrder from './pages/orders/CreateOrder';
import ProductionDashboard from './pages/production/Dashboard';
import ProductionOrderList from './pages/production/OrderList';
import ProductionOrderDetail from './pages/production/OrderDetail';
import MaterialList from './pages/inventory/MaterialList';
import ProductList from './pages/inventory/ProductList';
import InspectionList from './pages/quality/InspectionList';
import IssueList from './pages/quality/IssueList';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/create" element={<CreateOrder />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="production/dashboard" element={<ProductionDashboard />} />
        <Route path="production/orders" element={<ProductionOrderList />} />
        <Route path="production/orders/:id" element={<ProductionOrderDetail />} />
        <Route path="inventory/materials" element={<MaterialList />} />
        <Route path="inventory/products" element={<ProductList />} />
        <Route path="quality/inspections" element={<InspectionList />} />
        <Route path="quality/issues" element={<IssueList />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
```

- [ ] **Step 2: Create components/Layout.tsx**

```tsx
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const { Content } = Layout;

const MainLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Content style={{ padding: '24px', background: '#f5f5f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
```

- [ ] **Step 3: Create components/Sidebar.tsx**

```tsx
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  InboxOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/customers',
    icon: <UserOutlined />,
    label: 'Customers',
  },
  {
    key: '/orders',
    icon: <ShoppingCartOutlined />,
    label: 'Orders',
  },
  {
    key: '/production',
    icon: <ToolOutlined />,
    label: 'Production',
    children: [
      { key: '/production/dashboard', label: 'Dashboard' },
      { key: '/production/orders', label: 'Orders' },
    ],
  },
  {
    key: '/inventory',
    icon: <InboxOutlined />,
    label: 'Inventory',
    children: [
      { key: '/inventory/materials', label: 'Materials' },
      { key: '/inventory/products', label: 'Products' },
    ],
  },
  {
    key: '/quality',
    icon: <CheckCircleOutlined />,
    label: 'Quality',
    children: [
      { key: '/quality/inspections', label: 'Inspections' },
      { key: '/quality/issues', label: 'Issues' },
    ],
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider width={250} theme="dark">
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: 20 }}>ERP System</h1>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['/production', '/inventory', '/quality']}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default Sidebar;
```

- [ ] **Step 4: Create components/ProtectedRoute.tsx**

```tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/App.tsx frontend/src/components/
git commit -m "feat: add layout and routing components"
```

---

## Task 17: Frontend Pages - Dashboard and Login

**Covers:** S4

**Files:**
- Create: `frontend/src/pages/Dashboard.tsx`
- Create: `frontend/src/pages/Login.tsx`

- [ ] **Step 1: Create pages/Dashboard.tsx**

```tsx
import { Card, Col, Row, Statistic } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { customerApi } from '../api/customers';
import { orderApi } from '../api/orders';
import { productionApi } from '../api/production';

const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    orders: 0,
    production: 0,
    quality: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [customers, orders, production] = await Promise.all([
          customerApi.list({ limit: 1 }),
          orderApi.list({ limit: 1 }),
          productionApi.dashboard(),
        ]);
        setStats({
          customers: customers.data.length,
          orders: orders.data.length,
          production: production.data.total_orders,
          quality: 0,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    loadStats();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Customers" value={stats.customers} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Orders" value={stats.orders} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Production" value={stats.production} prefix={<ToolOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Quality" value={stats.quality} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
```

- [ ] **Step 2: Create pages/Login.tsx**

```tsx
import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('Login successful');
      navigate('/');
    } catch (error) {
      message.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card title="ERP System Login" style={{ width: 400 }}>
        <Form onFinish={onFinish} autoComplete="off">
          <Form.Item name="username" rules={[{ required: true, message: 'Please input username' }]}>
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please input password' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Dashboard.tsx frontend/src/pages/Login.tsx
git commit -m "feat: add dashboard and login pages"
```

---

## Task 18: Frontend Pages - Customer Module

**Covers:** S4

**Files:**
- Create: `frontend/src/pages/customers/CustomerList.tsx`
- Create: `frontend/src/pages/customers/CustomerDetail.tsx`

- [ ] **Step 1: Create pages/customers/CustomerList.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { customerApi, Customer } from '../../api/customers';

const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerApi.list({ limit: 100 });
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const columns = [
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Country', dataIndex: 'country', key: 'country' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag color={level === 'vip' ? 'gold' : level === 'important' ? 'blue' : 'default'}>
          {level.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Customer) => (
        <Button type="link" onClick={() => navigate(`/customers/${record.id}`)}>
          View
        </Button>
      ),
    },
  ];

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Customers</h2>
        <Space>
          <Input
            placeholder="Search customers..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />}>
            Add Customer
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={filteredCustomers} loading={loading} rowKey="id" />
    </div>
  );
};

export default CustomerList;
```

- [ ] **Step 2: Create pages/customers/CustomerDetail.tsx**

```tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Space, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { customerApi, Customer, Contact, FollowUp } from '../../api/customers';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer & { contacts: Contact[]; follow_ups: FollowUp[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [followUpModalVisible, setFollowUpModalVisible] = useState(false);
  const [contactForm] = Form.useForm();
  const [followUpForm] = Form.useForm();

  const loadCustomer = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await customerApi.get(parseInt(id));
      setCustomer(response.data);
    } catch (error) {
      console.error('Failed to load customer:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const handleAddContact = async (values: any) => {
    if (!id) return;
    try {
      await customerApi.addContact(parseInt(id), values);
      message.success('Contact added');
      contactForm.resetFields();
      setContactModalVisible(false);
      loadCustomer();
    } catch (error) {
      message.error('Failed to add contact');
    }
  };

  const handleAddFollowUp = async (values: any) => {
    if (!id) return;
    try {
      await customerApi.addFollowUp(parseInt(id), values);
      message.success('Follow-up added');
      followUpForm.resetFields();
      setFollowUpModalVisible(false);
      loadCustomer();
    } catch (error) {
      message.error('Failed to add follow-up');
    }
  };

  if (!customer) return null;

  const contactColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Position', dataIndex: 'position', key: 'position' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Primary',
      dataIndex: 'is_primary',
      key: 'is_primary',
      render: (val: boolean) => (val ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>),
    },
  ];

  const followUpColumns = [
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Content', dataIndex: 'content', key: 'content' },
    { title: 'Next Follow', dataIndex: 'next_follow_date', key: 'next_follow_date' },
  ];

  return (
    <div>
      <h2>Customer Detail</h2>
      <Card loading={loading}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Code">{customer.code}</Descriptions.Item>
          <Descriptions.Item label="Name">{customer.name}</Descriptions.Item>
          <Descriptions.Item label="Level">
            <Tag color={customer.level === 'vip' ? 'gold' : 'blue'}>{customer.level.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={customer.status === 'active' ? 'green' : 'red'}>{customer.status.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Country">{customer.country}</Descriptions.Item>
          <Descriptions.Item label="Source">{customer.source}</Descriptions.Item>
          <Descriptions.Item label="Email">{customer.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{customer.phone}</Descriptions.Item>
          <Descriptions.Item label="Address" span={2}>{customer.address}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="Contacts"
        style={{ marginTop: 16 }}
        extra={
          <Button icon={<PlusOutlined />} onClick={() => setContactModalVisible(true)}>
            Add Contact
          </Button>
        }
      >
        <Table columns={contactColumns} dataSource={customer.contacts} rowKey="id" pagination={false} />
      </Card>

      <Card
        title="Follow-ups"
        style={{ marginTop: 16 }}
        extra={
          <Button icon={<PlusOutlined />} onClick={() => setFollowUpModalVisible(true)}>
            Add Follow-up
          </Button>
        }
      >
        <Table columns={followUpColumns} dataSource={customer.follow_ups} rowKey="id" pagination={false} />
      </Card>

      <Modal title="Add Contact" open={contactModalVisible} onCancel={() => setContactModalVisible(false)} onOk={() => contactForm.submit()}>
        <Form form={contactForm} onFinish={handleAddContact} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="position" label="Position">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Add Follow-up" open={followUpModalVisible} onCancel={() => setFollowUpModalVisible(false)} onOk={() => followUpForm.submit()}>
        <Form form={followUpForm} onFinish={handleAddFollowUp} layout="vertical">
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="Content" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerDetail;
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/customers/
git commit -m "feat: add customer list and detail pages"
```

---

## Task 19: Frontend Pages - Order Module

**Covers:** S4

**Files:**
- Create: `frontend/src/pages/orders/OrderList.tsx`
- Create: `frontend/src/pages/orders/OrderDetail.tsx`
- Create: `frontend/src/pages/orders/CreateOrder.tsx`

- [ ] **Step 1: Create pages/orders/OrderList.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { orderApi, Order } from '../../api/orders';

const statusColors: Record<string, string> = {
  pending: 'default',
  confirmed: 'blue',
  production: 'orange',
  quality: 'purple',
  packaging: 'cyan',
  shipping: 'geekblue',
  completed: 'green',
  cancelled: 'red',
};

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await orderApi.list({ limit: 100 });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const columns = [
    { title: 'Order No', dataIndex: 'order_no', key: 'order_no' },
    { title: 'Customer ID', dataIndex: 'customer_id', key: 'customer_id' },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (val: number) => val ? `$${val.toFixed(2)}` : '-',
    },
    { title: 'Delivery Date', dataIndex: 'delivery_date', key: 'delivery_date' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Order) => (
        <Button type="link" onClick={() => navigate(`/orders/${record.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Orders</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/orders/create')}>
          Create Order
        </Button>
      </div>
      <Table columns={columns} dataSource={orders} loading={loading} rowKey="id" />
    </div>
  );
};

export default OrderList;
```

- [ ] **Step 2: Create pages/orders/OrderDetail.tsx**

```tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Select, message } from 'antd';
import { orderApi, Order, OrderItem } from '../../api/orders';

const statusColors: Record<string, string> = {
  pending: 'default',
  confirmed: 'blue',
  production: 'orange',
  quality: 'purple',
  packaging: 'cyan',
  shipping: 'geekblue',
  completed: 'green',
  cancelled: 'red',
};

const statusOptions = [
  'pending', 'confirmed', 'production', 'quality', 'packaging', 'shipping', 'completed', 'cancelled',
];

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order & { items: OrderItem[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await orderApi.get(parseInt(id));
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await orderApi.updateStatus(parseInt(id), status);
      message.success('Status updated');
      loadOrder();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  if (!order) return null;

  const itemColumns = [
    { title: 'Product', dataIndex: 'product_name', key: 'product_name' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (val: number) => val ? `$${val.toFixed(2)}` : '-',
    },
    { title: 'Specs', dataIndex: 'specs', key: 'specs' },
  ];

  return (
    <div>
      <h2>Order Detail</h2>
      <Card loading={loading}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Order No">{order.order_no}</Descriptions.Item>
          <Descriptions.Item label="Customer ID">{order.customer_id}</Descriptions.Item>
          <Descriptions.Item label="Total">
            {order.total_amount ? `$${order.total_amount.toFixed(2)}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Delivery Date">{order.delivery_date || '-'}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Select
              value={order.status}
              onChange={handleStatusChange}
              options={statusOptions.map((s) => ({
                value: s,
                label: <Tag color={statusColors[s]}>{s.toUpperCase()}</Tag>,
              }))}
              style={{ width: 200 }}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Remarks">{order.remarks || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Order Items" style={{ marginTop: 16 }}>
        <Table columns={itemColumns} dataSource={order.items} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
};

export default OrderDetail;
```

- [ ] **Step 3: Create pages/orders/CreateOrder.tsx**

```tsx
import { useState } from 'react';
import { Card, Form, Input, Button, InputNumber, Space, Table, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { orderApi, OrderCreate } from '../../api/orders';

const CreateOrder = () => {
  const [form] = Form.useForm();
  const [items, setItems] = useState<{ product_name: string; quantity: number; unit_price?: number; specs?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddItem = () => {
    setItems([...items, { product_name: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const onFinish = async (values: any) => {
    if (items.length === 0) {
      message.error('Add at least one item');
      return;
    }

    setLoading(true);
    try {
      const data: OrderCreate = {
        customer_id: values.customer_id,
        delivery_date: values.delivery_date,
        remarks: values.remarks,
        items,
      };
      await orderApi.create(data);
      message.success('Order created');
      navigate('/orders');
    } catch (error) {
      message.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const itemColumns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      render: (_: any, __: any, index: number) => (
        <Input value={items[index].product_name} onChange={(e) => handleItemChange(index, 'product_name', e.target.value)} />
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      render: (_: any, __: any, index: number) => (
        <InputNumber value={items[index].quantity} min={1} onChange={(val) => handleItemChange(index, 'quantity', val)} />
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      render: (_: any, __: any, index: number) => (
        <InputNumber value={items[index].unit_price} min={0} onChange={(val) => handleItemChange(index, 'unit_price', val)} />
      ),
    },
    {
      title: 'Specs',
      dataIndex: 'specs',
      render: (_: any, __: any, index: number) => (
        <Input value={items[index].specs} onChange={(e) => handleItemChange(index, 'specs', e.target.value)} />
      ),
    },
    {
      title: 'Action',
      render: (_: any, __: any, index: number) => (
        <Button icon={<DeleteOutlined />} onClick={() => handleRemoveItem(index)} danger />
      ),
    },
  ];

  return (
    <div>
      <h2>Create Order</h2>
      <Card>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="customer_id" label="Customer ID" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="delivery_date" label="Delivery Date">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Card>

      <Card
        title="Order Items"
        style={{ marginTop: 16 }}
        extra={
          <Button icon={<PlusOutlined />} onClick={handleAddItem}>
            Add Item
          </Button>
        }
      >
        <Table columns={itemColumns} dataSource={items} rowKey={(_, i) => i.toString()} pagination={false} />
      </Card>

      <Space style={{ marginTop: 16 }}>
        <Button type="primary" onClick={() => form.submit()} loading={loading}>
          Create Order
        </Button>
        <Button onClick={() => navigate('/orders')}>Cancel</Button>
      </Space>
    </div>
  );
};

export default CreateOrder;
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/orders/
git commit -m "feat: add order list, detail, and create pages"
```

---

## Task 20: Frontend Pages - Production Module

**Covers:** S4

**Files:**
- Create: `frontend/src/pages/production/Dashboard.tsx`
- Create: `frontend/src/pages/production/OrderList.tsx`
- Create: `frontend/src/pages/production/OrderDetail.tsx`

- [ ] **Step 1: Create pages/production/Dashboard.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import {
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { productionApi, ProductionDashboard as DashboardData } from '../../api/production';

const ProductionDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const response = await productionApi.dashboard();
        setData(response.data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (!data) return null;

  return (
    <div>
      <h2>Production Dashboard</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Orders" value={data.total_orders} prefix={<ToolOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="In Progress" value={data.in_progress} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Completed" value={data.completed} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Delayed" value={data.delayed} prefix={<ExclamationCircleOutlined />} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductionDashboard;
```

- [ ] **Step 2: Create pages/production/OrderList.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Table, Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { productionApi, ProductionOrder } from '../../api/production';

const statusColors: Record<string, string> = {
  pending: 'default',
  in_progress: 'blue',
  completed: 'green',
  delayed: 'red',
};

const ProductionOrderList = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await productionApi.listOrders({ limit: 100 });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Order ID', dataIndex: 'order_id', key: 'order_id' },
    { title: 'Workshop', dataIndex: 'assigned_workshop', key: 'assigned_workshop' },
    { title: 'Planned Start', dataIndex: 'planned_start', key: 'planned_start' },
    { title: 'Planned End', dataIndex: 'planned_end', key: 'planned_end' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: ProductionOrder) => (
        <Button type="link" onClick={() => navigate(`/production/orders/${record.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Production Orders</h2>
        <Button type="primary" icon={<PlusOutlined />}>
          Create Production Order
        </Button>
      </div>
      <Table columns={columns} dataSource={orders} loading={loading} rowKey="id" />
    </div>
  );
};

export default ProductionOrderList;
```

- [ ] **Step 3: Create pages/production/OrderDetail.tsx**

```tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Steps, message } from 'antd';
import { productionApi, ProductionOrder, ProductionStage } from '../../api/production';

const statusColors: Record<string, string> = {
  pending: 'default',
  in_progress: 'blue',
  completed: 'green',
};

const ProductionOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<ProductionOrder & { stages: ProductionStage[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await productionApi.getOrder(parseInt(id));
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleStageUpdate = async (stageId: number, status: string) => {
    try {
      await productionApi.updateStage(stageId, status);
      message.success('Stage updated');
      loadOrder();
    } catch (error) {
      message.error('Failed to update stage');
    }
  };

  if (!order) return null;

  const stageColumns = [
    { title: 'Stage', dataIndex: 'stage_name', key: 'stage_name' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>{status.toUpperCase()}</Tag>
      ),
    },
    { title: 'Progress', dataIndex: 'progress', key: 'progress', render: (val: number) => `${val}%` },
    { title: 'Start Time', dataIndex: 'start_time', key: 'start_time' },
    { title: 'End Time', dataIndex: 'end_time', key: 'end_time' },
  ];

  return (
    <div>
      <h2>Production Order Detail</h2>
      <Card loading={loading}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID">{order.id}</Descriptions.Item>
          <Descriptions.Item label="Order ID">{order.order_id}</Descriptions.Item>
          <Descriptions.Item label="Workshop">{order.assigned_workshop || '-'}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusColors[order.status] || 'default'}>{order.status.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Planned Start">{order.planned_start || '-'}</Descriptions.Item>
          <Descriptions.Item label="Planned End">{order.planned_end || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Production Stages" style={{ marginTop: 16 }}>
        <Table columns={stageColumns} dataSource={order.stages} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
};

export default ProductionOrderDetail;
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/production/
git commit -m "feat: add production dashboard and order pages"
```

---

## Task 21: Frontend Pages - Inventory Module

**Covers:** S4

**Files:**
- Create: `frontend/src/pages/inventory/MaterialList.tsx`
- Create: `frontend/src/pages/inventory/ProductList.tsx`

- [ ] **Step 1: Create pages/inventory/MaterialList.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, InputNumber, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { inventoryApi, Material } from '../../api/inventory';

const MaterialList = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.listMaterials({ limit: 100 });
      setMaterials(response.data);
    } catch (error) {
      console.error('Failed to load materials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      await inventoryApi.createMaterial(values);
      message.success('Material created');
      form.resetFields();
      setModalVisible(false);
      loadMaterials();
    } catch (error) {
      message.error('Failed to create material');
    }
  };

  const columns = [
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Unit', dataIndex: 'unit', key: 'unit' },
    {
      title: 'Current Stock',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (val: number, record: Material) => (
        <Tag color={val <= record.safety_stock ? 'red' : 'green'}>{val}</Tag>
      ),
    },
    { title: 'Safety Stock', dataIndex: 'safety_stock', key: 'safety_stock' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Materials</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Add Material
        </Button>
      </div>
      <Table columns={columns} dataSource={materials} loading={loading} rowKey="id" />

      <Modal title="Add Material" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="unit" label="Unit" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="safety_stock" label="Safety Stock">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MaterialList;
```

- [ ] **Step 2: Create pages/inventory/ProductList.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Table, Button, Tag, Modal, Form, Input, InputNumber, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { inventoryApi, FinishedProduct } from '../../api/inventory';

const ProductList = () => {
  const [products, setProducts] = useState<FinishedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.listProducts({ limit: 100 });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      await inventoryApi.createProduct(values);
      message.success('Product created');
      form.resetFields();
      setModalVisible(false);
      loadProducts();
    } catch (error) {
      message.error('Failed to create product');
    }
  };

  const columns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Product Name', dataIndex: 'product_name', key: 'product_name' },
    {
      title: 'Current Stock',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (val: number, record: FinishedProduct) => (
        <Tag color={val <= record.safety_stock ? 'red' : 'green'}>{val}</Tag>
      ),
    },
    { title: 'Safety Stock', dataIndex: 'safety_stock', key: 'safety_stock' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Finished Products</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Add Product
        </Button>
      </div>
      <Table columns={columns} dataSource={products} loading={loading} rowKey="id" />

      <Modal title="Add Product" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="product_name" label="Product Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="safety_stock" label="Safety Stock">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductList;
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/inventory/
git commit -m "feat: add material and product list pages"
```

---

## Task 22: Frontend Pages - Quality Module

**Covers:** S4

**Files:**
- Create: `frontend/src/pages/quality/InspectionList.tsx`
- Create: `frontend/src/pages/quality/IssueList.tsx`

- [ ] **Step 1: Create pages/quality/InspectionList.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Table, Button, Tag, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { qualityApi, QualityInspection } from '../../api/quality';

const InspectionList = () => {
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadInspections = async () => {
    setLoading(true);
    try {
      const response = await qualityApi.listInspections({ limit: 100 });
      setInspections(response.data);
    } catch (error) {
      console.error('Failed to load inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInspections();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      await qualityApi.createInspection(values);
      message.success('Inspection created');
      form.resetFields();
      setModalVisible(false);
      loadInspections();
    } catch (error) {
      message.error('Failed to create inspection');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Type', dataIndex: 'inspection_type', key: 'inspection_type' },
    { title: 'Item ID', dataIndex: 'item_id', key: 'item_id' },
    {
      title: 'Result',
      dataIndex: 'result',
      key: 'result',
      render: (result: string) => (
        <Tag color={result === 'pass' ? 'green' : 'red'}>{result.toUpperCase()}</Tag>
      ),
    },
    { title: 'Inspector', dataIndex: 'inspector', key: 'inspector' },
    { title: 'Inspect Time', dataIndex: 'inspect_time', key: 'inspect_time' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Quality Inspections</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Add Inspection
        </Button>
      </div>
      <Table columns={columns} dataSource={inspections} loading={loading} rowKey="id" />

      <Modal title="Add Inspection" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item name="inspection_type" label="Type" rules={[{ required: true }]}>
            <Select options={[
              { value: 'material', label: 'Material' },
              { value: 'semi_product', label: 'Semi-Product' },
              { value: 'finished', label: 'Finished Product' },
            ]} />
          </Form.Item>
          <Form.Item name="item_id" label="Item ID" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="result" label="Result" rules={[{ required: true }]}>
            <Select options={[
              { value: 'pass', label: 'Pass' },
              { value: 'fail', label: 'Fail' },
            ]} />
          </Form.Item>
          <Form.Item name="inspector" label="Inspector">
            <Input />
          </Form.Item>
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InspectionList;
```

- [ ] **Step 2: Create pages/quality/IssueList.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Table, Tag, Select, message } from 'antd';
import { qualityApi, QualityIssue } from '../../api/quality';

const IssueList = () => {
  const [issues, setIssues] = useState<QualityIssue[]>([]);
  const [loading, setLoading] = useState(false);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const response = await qualityApi.listIssues({ limit: 100 });
      setIssues(response.data);
    } catch (error) {
      console.error('Failed to load issues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await qualityApi.updateIssue(id, status);
      message.success('Status updated');
      loadIssues();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Inspection ID', dataIndex: 'inspection_id', key: 'inspection_id' },
    { title: 'Type', dataIndex: 'issue_type', key: 'issue_type' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: QualityIssue) => (
        <Select
          value={status}
          onChange={(val) => handleStatusChange(record.id, val)}
          options={[
            { value: 'open', label: <Tag color="red">Open</Tag> },
            { value: 'in_progress', label: <Tag color="blue">In Progress</Tag> },
            { value: 'resolved', label: <Tag color="green">Resolved</Tag> },
          ]}
          style={{ width: 150 }}
        />
      ),
    },
  ];

  return (
    <div>
      <h2>Quality Issues</h2>
      <Table columns={columns} dataSource={issues} loading={loading} rowKey="id" />
    </div>
  );
};

export default IssueList;
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/quality/
git commit -m "feat: add inspection and issue list pages"
```

---

## Task 23: Backend Tests

**Covers:** S2, S3

**Files:**
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_customers.py`
- Create: `backend/tests/test_orders.py`

- [ ] **Step 1: Create tests/__init__.py**

```python
```

- [ ] **Step 2: Create tests/conftest.py**

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

- [ ] **Step 3: Create tests/test_customers.py**

```python
def test_create_customer(client):
    response = client.post("/api/v1/customers/", json={
        "name": "Test Customer",
        "code": "CUST001",
        "level": "normal",
        "country": "China",
        "email": "test@example.com",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Customer"
    assert data["code"] == "CUST001"


def test_list_customers(client):
    client.post("/api/v1/customers/", json={"name": "Customer 1", "code": "C001"})
    client.post("/api/v1/customers/", json={"name": "Customer 2", "code": "C002"})

    response = client.get("/api/v1/customers/")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_customer(client):
    create_response = client.post("/api/v1/customers/", json={"name": "Test", "code": "C001"})
    customer_id = create_response.json()["id"]

    response = client.get(f"/api/v1/customers/{customer_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Test"


def test_update_customer(client):
    create_response = client.post("/api/v1/customers/", json={"name": "Test", "code": "C001"})
    customer_id = create_response.json()["id"]

    response = client.put(f"/api/v1/customers/{customer_id}", json={"name": "Updated"})
    assert response.status_code == 200
    assert response.json()["name"] == "Updated"


def test_delete_customer(client):
    create_response = client.post("/api/v1/customers/", json={"name": "Test", "code": "C001"})
    customer_id = create_response.json()["id"]

    response = client.delete(f"/api/v1/customers/{customer_id}")
    assert response.status_code == 200

    response = client.get(f"/api/v1/customers/{customer_id}")
    assert response.status_code == 404
```

- [ ] **Step 4: Create tests/test_orders.py**

```python
def test_create_order(client):
    customer_response = client.post("/api/v1/customers/", json={"name": "Test", "code": "C001"})
    customer_id = customer_response.json()["id"]

    response = client.post("/api/v1/orders/", json={
        "customer_id": customer_id,
        "items": [
            {"product_name": "Product A", "quantity": 10, "unit_price": 100},
            {"product_name": "Product B", "quantity": 5, "unit_price": 200},
        ],
    })
    assert response.status_code == 200
    data = response.json()
    assert data["order_no"].startswith("ORD-")
    assert data["total_amount"] == 2000


def test_list_orders(client):
    customer_response = client.post("/api/v1/customers/", json={"name": "Test", "code": "C001"})
    customer_id = customer_response.json()["id"]

    client.post("/api/v1/orders/", json={
        "customer_id": customer_id,
        "items": [{"product_name": "P1", "quantity": 1}],
    })

    response = client.get("/api/v1/orders/")
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_update_order_status(client):
    customer_response = client.post("/api/v1/customers/", json={"name": "Test", "code": "C001"})
    customer_id = customer_response.json()["id"]

    order_response = client.post("/api/v1/orders/", json={
        "customer_id": customer_id,
        "items": [{"product_name": "P1", "quantity": 1}],
    })
    order_id = order_response.json()["id"]

    response = client.put(f"/api/v1/orders/{order_id}/status", params={"status": "confirmed"})
    assert response.status_code == 200
    assert response.json()["status"] == "confirmed"
```

- [ ] **Step 5: Run tests**

Run: `cd backend && pytest tests/ -v`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add backend/tests/
git commit -m "test: add customer and order API tests"
```

---

## Task 24: Final Integration and Verification

**Covers:** S1, S2, S3, S4

- [ ] **Step 1: Start backend server**

Run: `cd backend && uvicorn app.main:app --reload`
Expected: Server starts on http://localhost:8000

- [ ] **Step 2: Verify API docs accessible**

Open: http://localhost:8000/docs
Expected: Swagger UI loads with all endpoints

- [ ] **Step 3: Start frontend dev server**

Run: `cd frontend && npm run dev`
Expected: Server starts on http://localhost:3000

- [ ] **Step 4: Verify frontend loads**

Open: http://localhost:3000
Expected: Login page displays

- [ ] **Step 5: Run all backend tests**

Run: `cd backend && pytest tests/ -v`
Expected: All tests PASS

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: complete ERP system phase 1 implementation"
```
