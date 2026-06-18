# ERP System Design Specification

## [S1] Overall Architecture

Modular monolith architecture with FastAPI backend, React frontend, and PostgreSQL database.

```
Mimo/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # Application entry
│   │   ├── core/              # Core config, database, security
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic request/response models
│   │   ├── api/               # API routes
│   │   │   ├── v1/
│   │   │   │   ├── customers.py
│   │   │   │   ├── orders.py
│   │   │   │   ├── inventory.py
│   │   │   │   ├── quality.py
│   │   │   │   └── production.py
│   │   ├── services/          # Business logic layer
│   │   └── utils/             # Utility functions
│   ├── alembic/               # Database migrations
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── api/               # API call wrappers
│   │   ├── components/        # Shared components
│   │   ├── pages/             # Page components
│   │   │   ├── customers/
│   │   │   ├── orders/
│   │   │   ├── inventory/
│   │   │   ├── quality/
│   │   │   └── production/
│   │   ├── hooks/             # Custom Hooks
│   │   ├── store/             # State management (Zustand)
│   │   └── utils/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml          # Local dev environment
└── README.md
```

**Tech Stack:**
- Backend: Python FastAPI
- Frontend: React + Ant Design
- Database: PostgreSQL
- ORM: SQLAlchemy + Alembic
- State Management: Zustand
- HTTP Client: Axios
- Authentication: JWT

## [S2] Database Design

### Customer Management
- `customers` - Customer basic info (id, name, code, level, source, country, email, phone, address, status)
- `contacts` - Contacts (id, customer_id, name, position, phone, email, is_primary)
- `follow_ups` - Follow-up records (id, customer_id, contact_id, type, content, next_follow_date)

### Order Management
- `orders` - Order main table (id, order_no, customer_id, status, total_amount, delivery_date)
- `order_items` - Order items (id, order_id, product_name, quantity, unit_price, specs)

### Production Progress
- `production_orders` - Production work orders (id, order_id, status, assigned_workshop, planned_start, planned_end)
- `production_stages` - Production stages (id, production_order_id, stage_name, status, start_time, end_time, progress)

### Inventory Management
- `materials` - Raw materials (id, name, code, unit, safety_stock, current_stock)
- `finished_products` - Finished products (id, product_name, sku, current_stock, safety_stock)
- `stock_transactions` - Stock in/out records (id, item_type, item_id, transaction_type, quantity, reason)

### Quality Management
- `quality_inspections` - Inspection records (id, inspection_type, item_id, result, inspector, inspect_time)
- `quality_issues` - Quality issues (id, inspection_id, issue_type, description, status)

## [S3] API Design

RESTful API routes:

```
/api/v1/customers          GET/POST      # Customer list/create
/api/v1/customers/{id}     GET/PUT/DELETE # Customer detail/update/delete
/api/v1/customers/{id}/contacts          # Contact management
/api/v1/customers/{id}/follow-ups        # Follow-up records

/api/v1/orders             GET/POST      # Order list/create
/api/v1/orders/{id}        GET/PUT       # Order detail/update
/api/v1/orders/{id}/status PUT           # Status change

/api/v1/inventory/materials              # Material inventory
/api/v1/inventory/products               # Product inventory
/api/v1/inventory/transactions           # Stock transactions

/api/v1/quality/inspections              # Inspection records
/api/v1/quality/issues                   # Quality issues

/api/v1/production/orders                # Production orders
/api/v1/production/orders/{id}/stages    # Production stages
/api/v1/production/dashboard             # Dashboard data
```

## [S4] Frontend Page Structure

```
/                           # Dashboard
/customers                  # Customer list
/customers/:id              # Customer detail
/orders                     # Order list
/orders/:id                 # Order detail
/orders/create              # Create order
/inventory/materials        # Material inventory
/inventory/products         # Product inventory
/quality/inspections        # Inspection records
/quality/issues             # Quality issues
/production/dashboard       # Production dashboard
/production/orders          # Production orders
/production/orders/:id      # Order detail
```

**Frontend Tech:**
- State Management: Zustand
- Routing: React Router v6
- HTTP Client: Axios
- UI Components: Ant Design
- Charts: Ant Design Charts

## [S5] Implementation Phases

### Phase 1.1 - Basic Framework
- Project initialization (frontend + backend)
- Database configuration and migrations
- User authentication (JWT)
- Basic UI framework (layout, routing, navigation)

### Phase 1.2 - Customer Management Module
- Customer CRUD
- Contact management
- Follow-up records

### Phase 1.3 - Order Management Module
- Order creation and editing
- Status workflow
- Order query

### Phase 1.4 - Production Progress Module
- Production work order management
- Production stage tracking
- Production dashboard

### Phase 1.5 - Inventory Management Module
- Material/product inventory
- Stock in/out management
- Inventory alerts

### Phase 1.6 - Quality Management Module
- Inspection records
- Quality issue tracking

## Non-Goals (Phase 1)
- Customer portal system
- Message notification system
- Data analytics center
- Logistics management
- Advanced reporting
