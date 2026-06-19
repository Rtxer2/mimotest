# 数据大屏 (Analytics Dashboard) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive analytics dashboard page with charts showing order trends, production stats, inventory overview, quality metrics, and approval summary.

**Architecture:** Single backend API endpoint aggregates all data from existing models. Frontend page uses recharts for visualization with antd layout.

**Tech Stack:** Python/FastAPI (backend), React/TypeScript/Ant Design/recharts (frontend)

---

### Task 1: Create Analytics Service

**Covers:** [S4] Backend API data aggregation

**Files:**
- Create: `backend/app/services/analytics_service.py`

- [ ] **Step 1: Create the analytics service**

Create `backend/app/services/analytics_service.py`:

```python
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract

from app.models.customer import Customer
from app.models.order import Order
from app.models.production import ProductionOrder
from app.models.inventory import Material, FinishedProduct
from app.models.quality import QualityInspection, QualityIssue
from app.models.approval import ApprovalInstance


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard(self):
        return {
            "metrics": self._get_metrics(),
            "order_trend": self._get_order_trend(),
            "order_status_distribution": self._get_order_status_distribution(),
            "production_stats": self._get_production_stats(),
            "inventory_stats": self._get_inventory_stats(),
            "quality_stats": self._get_quality_stats(),
            "approval_stats": self._get_approval_stats(),
        }

    def _get_metrics(self):
        total_customers = self.db.query(func.count(Customer.id)).scalar() or 0
        total_orders = self.db.query(func.count(Order.id)).scalar() or 0
        total_amount = self.db.query(func.coalesce(func.sum(Order.total_amount), 0)).scalar()
        active_production = self.db.query(func.count(ProductionOrder.id)).filter(
            ProductionOrder.status.in_(["pending", "in_progress"])
        ).scalar() or 0
        low_stock = self.db.query(func.count(Material.id)).filter(
            and_(Material.safety_stock > 0, Material.current_stock < Material.safety_stock)
        ).scalar() or 0
        pending_approvals = self.db.query(func.count(ApprovalInstance.id)).filter(
            ApprovalInstance.status == "pending"
        ).scalar() or 0

        return {
            "total_customers": total_customers,
            "total_orders": total_orders,
            "total_order_amount": float(total_amount),
            "active_production_orders": active_production,
            "low_stock_materials": low_stock,
            "pending_approvals": pending_approvals,
        }

    def _get_order_trend(self):
        rows = self.db.query(
            extract("year", Order.created_at).label("year"),
            extract("month", Order.created_at).label("month"),
            func.count(Order.id).label("count"),
            func.coalesce(func.sum(Order.total_amount), 0).label("amount"),
        ).group_by("year", "month").order_by("year", "month").limit(12).all()

        return [
            {
                "period": f"{int(r.year)}-{int(r.month):02d}",
                "count": r.count,
                "amount": float(r.amount),
            }
            for r in rows
        ]

    def _get_order_status_distribution(self):
        rows = self.db.query(
            Order.status,
            func.count(Order.id).label("count"),
        ).group_by(Order.status).all()

        return [{"status": r.status, "count": r.count} for r in rows]

    def _get_production_stats(self):
        rows = self.db.query(
            ProductionOrder.status,
            func.count(ProductionOrder.id).label("count"),
        ).group_by(ProductionOrder.status).all()

        return [{"status": r.status, "count": r.count} for r in rows]

    def _get_inventory_stats(self):
        total_materials = self.db.query(func.count(Material.id)).scalar() or 0
        low_stock_materials = self.db.query(func.count(Material.id)).filter(
            and_(Material.safety_stock > 0, Material.current_stock < Material.safety_stock)
        ).scalar() or 0
        total_products = self.db.query(func.count(FinishedProduct.id)).scalar() or 0
        low_stock_products = self.db.query(func.count(FinishedProduct.id)).filter(
            and_(FinishedProduct.safety_stock > 0, FinishedProduct.current_stock < FinishedProduct.safety_stock)
        ).scalar() or 0

        return {
            "total_materials": total_materials,
            "low_stock_materials": low_stock_materials,
            "total_products": total_products,
            "low_stock_products": low_stock_products,
        }

    def _get_quality_stats(self):
        total = self.db.query(func.count(QualityInspection.id)).scalar() or 0
        passed = self.db.query(func.count(QualityInspection.id)).filter(
            QualityInspection.result == "passed"
        ).scalar() or 0
        failed = total - passed
        open_issues = self.db.query(func.count(QualityIssue.id)).filter(
            QualityIssue.status == "open"
        ).scalar() or 0

        return {
            "total_inspections": total,
            "passed": passed,
            "failed": failed,
            "open_issues": open_issues,
        }

    def _get_approval_stats(self):
        rows = self.db.query(
            ApprovalInstance.status,
            func.count(ApprovalInstance.id).label("count"),
        ).group_by(ApprovalInstance.status).all()

        result = {"pending": 0, "approved": 0, "rejected": 0, "cancelled": 0}
        for r in rows:
            if r.status in result:
                result[r.status] = r.count
        return result
```

- [ ] **Step 2: Verify syntax**

Run: `python3 -m py_compile backend/app/services/analytics_service.py`

- [ ] **Step 3: Commit**

```bash
git add backend/app/services/analytics_service.py
git commit -m "feat: add analytics service with dashboard aggregation"
```

---

### Task 2: Create Analytics API Endpoint

**Covers:** [S4] Backend API endpoint

**Files:**
- Create: `backend/app/api/v1/analytics.py`
- Modify: `backend/app/api/v1/__init__.py`

- [ ] **Step 1: Create analytics router**

Create `backend/app/api/v1/analytics.py`:

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, get_current_active_user
from app.models.user import User
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
):
    service = AnalyticsService(db)
    return service.get_dashboard()
```

- [ ] **Step 2: Register router**

Add to `backend/app/api/v1/__init__.py`:

```python
from app.api.v1 import auth, customers, orders, production, inventory, quality, dict, users, notifications, approvals, analytics
```

And add the router:

```python
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
```

- [ ] **Step 3: Verify syntax**

Run: `python3 -m py_compile backend/app/api/v1/analytics.py && python3 -m py_compile backend/app/api/v1/__init__.py`

- [ ] **Step 4: Commit**

```bash
git add backend/app/api/v1/analytics.py backend/app/api/v1/__init__.py
git commit -m "feat: add analytics API endpoint"
```

---

### Task 3: Install recharts and Create AnalyticsDashboard Page

**Covers:** [S3] Page layout, [S5] Frontend components

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/src/pages/AnalyticsDashboard.tsx`

- [ ] **Step 1: Install recharts**

Run: `cd frontend && npm install recharts`

- [ ] **Step 2: Create AnalyticsDashboard page**

Create `frontend/src/pages/AnalyticsDashboard.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';
import client from '../api/client';

interface DashboardData {
  metrics: {
    total_customers: number;
    total_orders: number;
    total_order_amount: number;
    active_production_orders: number;
    low_stock_materials: number;
    pending_approvals: number;
  };
  order_trend: Array<{ period: string; count: number; amount: number }>;
  order_status_distribution: Array<{ status: string; count: number }>;
  production_stats: Array<{ status: string; count: number }>;
  inventory_stats: {
    total_materials: number;
    low_stock_materials: number;
    total_products: number;
    low_stock_products: number;
  };
  quality_stats: {
    total_inspections: number;
    passed: number;
    failed: number;
    open_issues: number;
  };
  approval_stats: {
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
  };
}

const STATUS_LABELS: Record<string, string> = {
  pending: '待处理',
  pending_approval: '待审批',
  confirmed: '已确认',
  production: '生产中',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
  approved: '已通过',
  rejected: '已驳回',
};

const PIE_COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2'];

const AnalyticsDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await client.get('/analytics/dashboard');
        setData(res.data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!data) return null;

  const orderStatusData = data.order_status_distribution.map((item) => ({
    name: STATUS_LABELS[item.status] ?? item.status,
    value: item.count,
  }));

  const productionData = data.production_stats.map((item) => ({
    name: STATUS_LABELS[item.status] ?? item.status,
    count: item.count,
  }));

  const qualityData = [
    { name: '通过', value: data.quality_stats.passed },
    { name: '未通过', value: data.quality_stats.failed },
  ];

  const approvalData = [
    { name: '待审批', value: data.approval_stats.pending },
    { name: '已通过', value: data.approval_stats.approved },
    { name: '已驳回', value: data.approval_stats.rejected },
    { name: '已取消', value: data.approval_stats.cancelled },
  ].filter((item) => item.value > 0);

  return (
    <div>
      <h2>数据大屏</h2>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card>
            <Statistic title="客户总数" value={data.metrics.total_customers} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="订单总数" value={data.metrics.total_orders} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="订单总额" value={data.metrics.total_order_amount} prefix="¥" precision={2} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="生产中工单" value={data.metrics.active_production_orders} prefix={<ToolOutlined />} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="库存预警" value={data.metrics.low_stock_materials} prefix={<InboxOutlined />} valueStyle={{ color: data.metrics.low_stock_materials > 0 ? '#ff4d4f' : undefined }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="待审批" value={data.metrics.pending_approvals} prefix={<AuditOutlined />} valueStyle={{ color: data.metrics.pending_approvals > 0 ? '#faad14' : undefined }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card title="订单趋势">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.order_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="count" name="订单数" stroke="#1890ff" />
                <Line yAxisId="right" type="monotone" dataKey="amount" name="金额" stroke="#52c41a" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="订单状态分布">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={orderStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {orderStatusData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Card title="生产工单统计">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="数量" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="质量检验">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={qualityData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  <Cell fill="#52c41a" />
                  <Cell fill="#ff4d4f" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              检验总数: {data.quality_stats.total_inspections} | 未关闭问题: {data.quality_stats.open_issues}
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="审批概览">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={approvalData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {approvalData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsDashboard;
```

- [ ] **Step 3: Verify TypeScript**

Run: `cd frontend && npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/pages/AnalyticsDashboard.tsx
git commit -m "feat: add analytics dashboard page with recharts"
```

---

### Task 4: Add Route and Sidebar Menu Item

**Covers:** [S6] Route and navigation

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/Sidebar.tsx`

- [ ] **Step 1: Add route in App.tsx**

Add import:
```tsx
import AnalyticsDashboard from './pages/AnalyticsDashboard';
```

Add route inside the `<Route path="/" ...>` element:
```tsx
<Route path="analytics" element={<AnalyticsDashboard />} />
```

- [ ] **Step 2: Add sidebar menu item**

In `Sidebar.tsx`, add icon import:
```tsx
import { BarChartOutlined } from '@ant-design/icons';
```

Add menu item after the Dashboard item (after `key: '/'`):
```tsx
{
  key: '/analytics',
  icon: <BarChartOutlined />,
  label: '数据大屏',
},
```

- [ ] **Step 3: Verify TypeScript**

Run: `cd frontend && npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.tsx frontend/src/components/Sidebar.tsx
git commit -m "feat: add analytics route and sidebar menu item"
```

---

### Task 5: Final Verification

**Covers:** End-to-end build verification

**Files:** (none — verification only)

- [ ] **Step 1: Verify backend syntax**

Run:
```bash
python3 -m py_compile backend/app/services/analytics_service.py
python3 -m py_compile backend/app/api/v1/analytics.py
python3 -m py_compile backend/app/api/v1/__init__.py
```

- [ ] **Step 2: Verify frontend build**

Run: `cd frontend && npm run build`

- [ ] **Step 3: Final commit (if needed)**

```bash
git status
```
