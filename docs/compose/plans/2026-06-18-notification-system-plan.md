# Notification System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a notification system that alerts users about order, production, inventory, and quality events via in-app messages.

**Architecture:** Service layer hooks call NotificationService to create notifications based on configurable rules. Frontend polls for unread count and displays notifications in a dropdown and dedicated page.

**Tech Stack:** FastAPI, SQLAlchemy, React, Ant Design, Zustand

---

## File Structure

### Backend Files
```
backend/
├── app/
│   ├── models/
│   │   └── notification.py          # Modify: add NotificationRule model
│   ├── schemas/
│   │   └── notification.py          # Create: Pydantic schemas
│   ├── services/
│   │   └── notification_service.py  # Create: notification business logic
│   ├── api/v1/
│   │   └── notifications.py         # Create: notification API endpoints
│   └── alembic/versions/
│       └── xxx_add_notification_rules_table.py  # Create: migration
```

### Frontend Files
```
frontend/
├── src/
│   ├── api/
│   │   └── notifications.ts         # Create: notification API client
│   ├── components/
│   │   └── NotificationBell.tsx      # Create: bell icon with dropdown
│   ├── pages/
│   │   └── notifications/
│   │       └── NotificationList.tsx   # Create: notification list page
│   ├── store/
│   │   └── notificationStore.ts      # Create: notification state management
│   ├── App.tsx                        # Modify: add notification route
│   └── components/
│       └── Layout.tsx                 # Modify: add NotificationBell
```

---

## Task 1: Database Models and Migration

**Covers:** S2

**Files:**
- Modify: `backend/app/models/notification.py`
- Create: `backend/alembic/versions/xxx_add_notification_rules_table.py`

- [ ] **Step 1: Update notification model**

```python
from sqlalchemy import Column, String, Integer, Text, Boolean, ForeignKey
from app.models.base import BaseModel


class Notification(BaseModel):
    __tablename__ = "notifications"

    user_id = Column(Integer, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, default="")
    type = Column(String(50), default="info")
    is_read = Column(Boolean, default=False)
    link = Column(String(500), default="")


class NotificationRule(BaseModel):
    __tablename__ = "notification_rules"

    event_type = Column(String(50), nullable=False, index=True)
    role = Column(String(20), nullable=True)
    user_id = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
```

- [ ] **Step 2: Update models/__init__.py**

```python
from app.models.notification import Notification, NotificationRule

__all__ = [
    # ... existing models ...
    "Notification", "NotificationRule",
]
```

- [ ] **Step 3: Generate migration**

Run: `cd backend && alembic revision --autogenerate -m "add notification rules table"`

- [ ] **Step 4: Verify migration file**

Check that the migration creates `notification_rules` table with correct columns.

- [ ] **Step 5: Commit**

```bash
git add backend/app/models/notification.py backend/app/models/__init__.py backend/alembic/versions/
git commit -m "feat: add notification rules model and migration"
```

---

## Task 2: Notification Schemas

**Covers:** S3

**Files:**
- Create: `backend/app/schemas/notification.py`

- [ ] **Step 1: Create notification schemas**

```python
from datetime import datetime
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    content: str
    type: str
    is_read: bool
    link: str
    created_at: datetime

    class Config:
        from_attributes = True


class UnreadCountResponse(BaseModel):
    count: int


class NotificationRuleCreate(BaseModel):
    event_type: str
    role: str | None = None
    user_id: int | None = None


class NotificationRuleUpdate(BaseModel):
    event_type: str | None = None
    role: str | None = None
    user_id: int | None = None
    is_active: bool | None = None


class NotificationRuleResponse(BaseModel):
    id: int
    event_type: str
    role: str | None
    user_id: int | None
    is_active: bool

    class Config:
        from_attributes = True
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/schemas/notification.py
git commit -m "feat: add notification schemas"
```

---

## Task 3: Notification Service

**Covers:** S1, S5

**Files:**
- Create: `backend/app/services/notification_service.py`

- [ ] **Step 1: Create notification service**

```python
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.notification import Notification, NotificationRule
from app.models.user import User


class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def create_notification(
        self,
        event_type: str,
        title: str,
        content: str,
        link: str = "",
        notification_type: str = "info"
    ):
        rules = self.db.query(NotificationRule).filter(
            and_(
                NotificationRule.event_type == event_type,
                NotificationRule.is_active == True
            )
        ).all()

        user_ids = set()
        for rule in rules:
            if rule.user_id:
                user_ids.add(rule.user_id)
            elif rule.role:
                role_users = self.db.query(User).filter(
                    and_(User.role == rule.role, User.is_active == True)
                ).all()
                for user in role_users:
                    user_ids.add(user.id)

        for user_id in user_ids:
            notification = Notification(
                user_id=user_id,
                title=title,
                content=content,
                type=notification_type,
                link=link
            )
            self.db.add(notification)

        self.db.commit()

    def get_user_notifications(self, user_id: int, skip: int = 0, limit: int = 20):
        return self.db.query(Notification).filter(
            Notification.user_id == user_id
        ).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

    def get_unread_count(self, user_id: int) -> int:
        return self.db.query(Notification).filter(
            and_(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
        ).count()

    def mark_as_read(self, notification_id: int, user_id: int):
        notification = self.db.query(Notification).filter(
            and_(
                Notification.id == notification_id,
                Notification.user_id == user_id
            )
        ).first()
        if notification:
            notification.is_read = True
            self.db.commit()
            return True
        return False

    def mark_all_as_read(self, user_id: int):
        self.db.query(Notification).filter(
            and_(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
        ).update({"is_read": True})
        self.db.commit()

    def list_rules(self, skip: int = 0, limit: int = 100):
        return self.db.query(NotificationRule).offset(skip).limit(limit).all()

    def get_rule(self, rule_id: int):
        return self.db.query(NotificationRule).filter(NotificationRule.id == rule_id).first()

    def create_rule(self, event_type: str, role: str | None = None, user_id: int | None = None):
        rule = NotificationRule(event_type=event_type, role=role, user_id=user_id)
        self.db.add(rule)
        self.db.commit()
        self.db.refresh(rule)
        return rule

    def update_rule(self, rule_id: int, **kwargs):
        rule = self.get_rule(rule_id)
        if not rule:
            return None
        for key, value in kwargs.items():
            if value is not None:
                setattr(rule, key, value)
        self.db.commit()
        self.db.refresh(rule)
        return rule

    def delete_rule(self, rule_id: int):
        rule = self.get_rule(rule_id)
        if not rule:
            return False
        self.db.delete(rule)
        self.db.commit()
        return True
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/services/notification_service.py
git commit -m "feat: add notification service"
```

---

## Task 4: Notification API Endpoints

**Covers:** S3

**Files:**
- Create: `backend/app/api/v1/notifications.py`
- Modify: `backend/app/api/v1/__init__.py`

- [ ] **Step 1: Create notification API**

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_any_role, require_admin
from app.models.user import User
from app.schemas.notification import (
    NotificationResponse, UnreadCountResponse,
    NotificationRuleCreate, NotificationRuleUpdate, NotificationRuleResponse
)
from app.services.notification_service import NotificationService
from app.api.deps import get_current_active_user

router = APIRouter()


@router.get("", response_model=list[NotificationResponse])
def list_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db_session)
):
    service = NotificationService(db)
    return service.get_user_notifications(current_user.id, skip=skip, limit=limit)


@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db_session)
):
    service = NotificationService(db)
    count = service.get_unread_count(current_user.id)
    return {"count": count}


@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db_session)
):
    service = NotificationService(db)
    if not service.mark_as_read(notification_id, current_user.id):
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Marked as read"}


@router.put("/read-all")
def mark_all_as_read(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db_session)
):
    service = NotificationService(db)
    service.mark_all_as_read(current_user.id)
    return {"message": "All notifications marked as read"}


# Admin-only rule management endpoints
@router.get("/rules", response_model=list[NotificationRuleResponse])
def list_rules(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db_session)
):
    service = NotificationService(db)
    return service.list_rules(skip=skip, limit=limit)


@router.post("/rules", response_model=NotificationRuleResponse)
def create_rule(
    data: NotificationRuleCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db_session)
):
    service = NotificationService(db)
    return service.create_rule(data.event_type, data.role, data.user_id)


@router.put("/rules/{rule_id}", response_model=NotificationRuleResponse)
def update_rule(
    rule_id: int,
    data: NotificationRuleUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db_session)
):
    service = NotificationService(db)
    rule = service.update_rule(rule_id, **data.model_dump(exclude_unset=True))
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    return rule


@router.delete("/rules/{rule_id}")
def delete_rule(
    rule_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db_session)
):
    service = NotificationService(db)
    if not service.delete_rule(rule_id):
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"message": "Rule deleted"}
```

- [ ] **Step 2: Register router in api/v1/__init__.py**

Add to imports:
```python
from app.api.v1 import notifications
```

Add to router:
```python
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/api/v1/notifications.py backend/app/api/v1/__init__.py
git commit -m "feat: add notification API endpoints"
```

---

## Task 5: Seed Default Notification Rules

**Covers:** S5

**Files:**
- Modify: `backend/scripts/seed_admin.py`

- [ ] **Step 1: Add seed function for notification rules**

Add to `seed_admin.py`:

```python
from app.models.notification import NotificationRule


def seed_notification_rules():
    db = SessionLocal()
    existing = db.query(NotificationRule).first()
    if existing:
        print("Notification rules already exist")
        db.close()
        return

    rules = [
        NotificationRule(event_type="order_created", role="manager", is_active=True),
        NotificationRule(event_type="order_status_changed", role="operator", is_active=True),
        NotificationRule(event_type="inventory_low", role="manager", is_active=True),
        NotificationRule(event_type="quality_issue_created", role="manager", is_active=True),
        NotificationRule(event_type="production_created", role="operator", is_active=True),
    ]
    for rule in rules:
        db.add(rule)
    db.commit()
    print("Default notification rules created")
    db.close()
```

Update `if __name__` block to call `seed_notification_rules()`.

- [ ] **Step 2: Commit**

```bash
git add backend/scripts/seed_admin.py
git commit -m "feat: add default notification rules seeding"
```

---

## Task 6: Integrate Notifications into Existing Services

**Covers:** S5

**Files:**
- Modify: `backend/app/services/order_service.py`
- Modify: `backend/app/services/inventory_service.py`
- Modify: `backend/app/services/quality_service.py`

- [ ] **Step 1: Add notification to order creation**

In `order_service.py`, add import and call in `create_order`:

```python
from app.services.notification_service import NotificationService

# In create_order method, after self.db.commit():
notification_service = NotificationService(self.db)
notification_service.create_notification(
    event_type="order_created",
    title=f"新订单: {order.order_no}",
    content=f"客户 {order.customer.name} 创建了新订单 {order.order_no}",
    link=f"/orders/{order.id}",
    notification_type="order"
)
```

- [ ] **Step 2: Add notification to order status update**

In `order_service.py`, add to `update_status`:

```python
notification_service = NotificationService(self.db)
notification_service.create_notification(
    event_type="order_status_changed",
    title=f"订单状态变更: {order.order_no}",
    content=f"订单 {order.order_no} 状态变更为 {status}",
    link=f"/orders/{order.id}",
    notification_type="order"
)
```

- [ ] **Step 3: Add notification to inventory low stock**

In `inventory_service.py`, add to `create_transaction` when stock goes below safety level:

```python
from app.services.notification_service import NotificationService

# After updating stock, check if below safety stock
if data.item_type == "material":
    material = self.get_material(data.item_id)
    if material and material.current_stock < material.safety_stock:
        notification_service = NotificationService(self.db)
        notification_service.create_notification(
            event_type="inventory_low",
            title=f"库存预警: {material.name}",
            content=f"原材料 {material.name} 当前库存 {material.current_stock} 低于安全库存 {material.safety_stock}",
            link="/inventory/materials",
            notification_type="inventory"
        )
```

- [ ] **Step 4: Add notification to quality issue creation**

In `quality_service.py`, add to `create_inspection` when result is fail:

```python
from app.services.notification_service import NotificationService

# After creating inspection, if result is fail:
if data.result == "fail":
    notification_service = NotificationService(self.db)
    notification_service.create_notification(
        event_type="quality_issue_created",
        title=f"质量问题: 质检不合格",
        content=f"质检记录 #{inspection.id} 结果为不合格，请及时处理",
        link="/quality/issues",
        notification_type="quality"
    )
```

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/order_service.py backend/app/services/inventory_service.py backend/app/services/quality_service.py
git commit -m "feat: integrate notifications into order, inventory, and quality services"
```

---

## Task 7: Frontend Notification API Client

**Covers:** S4

**Files:**
- Create: `frontend/src/api/notifications.ts`

- [ ] **Step 1: Create notification API client**

```typescript
import client from './client';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  content: string;
  type: string;
  is_read: boolean;
  link: string;
  created_at: string;
}

export interface NotificationRule {
  id: number;
  event_type: string;
  role: string | null;
  user_id: number | null;
  is_active: boolean;
}

export const notificationApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    client.get<Notification[]>('/notifications', { params }),

  getUnreadCount: () =>
    client.get<{ count: number }>('/notifications/unread-count'),

  markAsRead: (id: number) =>
    client.put(`/notifications/${id}/read`),

  markAllAsRead: () =>
    client.put('/notifications/read-all'),

  listRules: (params?: { skip?: number; limit?: number }) =>
    client.get<NotificationRule[]>('/notifications/rules', { params }),

  createRule: (data: { event_type: string; role?: string; user_id?: number }) =>
    client.post<NotificationRule>('/notifications/rules', data),

  updateRule: (id: number, data: { event_type?: string; role?: string; user_id?: number; is_active?: boolean }) =>
    client.put<NotificationRule>(`/notifications/rules/${id}`, data),

  deleteRule: (id: number) =>
    client.delete(`/notifications/rules/${id}`),
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/api/notifications.ts
git commit -m "feat: add notification API client"
```

---

## Task 8: Frontend Notification Store

**Covers:** S4

**Files:**
- Create: `frontend/src/store/notificationStore.ts`

- [ ] **Step 1: Create notification store**

```typescript
import { create } from 'zustand';
import { notificationApi, Notification } from '../api/notifications';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

let pollInterval: ReturnType<typeof setInterval> | null = null;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await notificationApi.list({ limit: 20 });
      set({ notifications: res.data });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      set({ unreadCount: res.data.count });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  markAsRead: async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  startPolling: () => {
    if (pollInterval) return;
    get().fetchUnreadCount();
    pollInterval = setInterval(() => {
      get().fetchUnreadCount();
    }, 30000);
  },

  stopPolling: () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  },
}));
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/store/notificationStore.ts
git commit -m "feat: add notification store"
```

---

## Task 9: Frontend NotificationBell Component

**Covers:** S4

**Files:**
- Create: `frontend/src/components/NotificationBell.tsx`
- Modify: `frontend/src/components/Layout.tsx`

- [ ] **Step 1: Create NotificationBell component**

```tsx
import { useEffect } from 'react';
import { Badge, Dropdown, List, Button, Typography, Empty } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../store/notificationStore';

const { Text } = Typography;

const NotificationBell = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    startPolling,
    stopPolling,
  } = useNotificationStore();

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, []);

  const handleClick = async (id: number, link: string) => {
    await markAsRead(id);
    if (link) {
      navigate(link);
    }
  };

  const dropdownContent = (
    <div style={{ width: 360, background: 'white', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>Notifications</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" icon={<CheckOutlined />} onClick={markAllAsRead}>
            Mark all read
          </Button>
        )}
      </div>
      <div style={{ maxHeight: 400, overflow: 'auto' }}>
        {notifications.length === 0 ? (
          <Empty description="No notifications" style={{ padding: '24px 0' }} />
        ) : (
          <List
            dataSource={notifications.slice(0, 10)}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  background: item.is_read ? 'transparent' : '#f6ffed',
                }}
                onClick={() => handleClick(item.id, item.link)}
              >
                <List.Item.Meta
                  title={<Text strong={!item.is_read}>{item.title}</Text>}
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.content}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {new Date(item.created_at).toLocaleString()}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
      <div style={{ padding: '8px 16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
        <Button type="link" onClick={() => navigate('/notifications')}>
          View all notifications
        </Button>
      </div>
    </div>
  );

  return (
    <Dropdown overlay={dropdownContent} trigger={['click']} placement="bottomRight">
      <Badge count={unreadCount} size="small">
        <Button type="text" icon={<BellOutlined />} style={{ fontSize: 18 }} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
```

- [ ] **Step 2: Add NotificationBell to Layout**

In `Layout.tsx`, import and add `NotificationBell` to the header area.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/NotificationBell.tsx frontend/src/components/Layout.tsx
git commit -m "feat: add notification bell component to header"
```

---

## Task 10: Frontend Notification List Page

**Covers:** S4

**Files:**
- Create: `frontend/src/pages/notifications/NotificationList.tsx`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/Sidebar.tsx`

- [ ] **Step 1: Create NotificationList page**

```tsx
import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, message } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import { Notification } from '../../api/notifications';

const typeColors: Record<string, string> = {
  order: 'blue',
  production: 'orange',
  inventory: 'purple',
  quality: 'red',
  info: 'default',
};

const NotificationList = () => {
  const navigate = useNavigate();
  const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const columns = [
    {
      title: 'Status',
      key: 'status',
      width: 80,
      render: (_: any, record: Notification) => (
        <Tag color={record.is_read ? 'default' : 'green'}>
          {record.is_read ? 'Read' : 'Unread'}
        </Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => <Tag color={typeColors[type] || 'default'}>{type}</Tag>,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: 'Time',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (t: string) => new Date(t).toLocaleString(),
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_: any, record: Notification) => (
        <Space>
          {!record.is_read && (
            <Button
              size="small"
              icon={<CheckOutlined />}
              onClick={() => markAsRead(record.id)}
            >
              Read
            </Button>
          )}
          {record.link && (
            <Button
              size="small"
              type="link"
              onClick={() => {
                markAsRead(record.id);
                navigate(record.link);
              }}
            >
              View
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Notifications</h2>
        <Space>
          <Button
            type={filter === 'all' ? 'primary' : 'default'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            type={filter === 'unread' ? 'primary' : 'default'}
            onClick={() => setFilter('unread')}
          >
            Unread
          </Button>
          <Button icon={<CheckOutlined />} onClick={markAllAsRead}>
            Mark all read
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={filteredNotifications}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
};

export default NotificationList;
```

- [ ] **Step 2: Add route in App.tsx**

Add import and route:
```tsx
import NotificationList from './pages/notifications/NotificationList';

// In Routes:
<Route path="notifications" element={<NotificationList />} />
```

- [ ] **Step 3: Add sidebar menu item**

In `Sidebar.tsx`, add to system menu children:
```tsx
{ key: '/notifications', label: 'Notifications' },
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/notifications/NotificationList.tsx frontend/src/App.tsx frontend/src/components/Sidebar.tsx
git commit -m "feat: add notification list page and routing"
```

---

## Task 11: Final Integration and Testing

**Covers:** S1, S2, S3, S4, S5

- [ ] **Step 1: Run database migration**

```bash
cd backend && alembic upgrade head
```

- [ ] **Step 2: Seed notification rules**

```bash
cd backend && python scripts/seed_admin.py
```

- [ ] **Step 3: Start backend and test API**

```bash
cd backend && uvicorn app.main:app --reload
```

Test endpoints:
- `GET /api/v1/notifications`
- `GET /api/v1/notifications/unread-count`
- `PUT /api/v1/notifications/read-all`

- [ ] **Step 4: Start frontend and verify UI**

```bash
cd frontend && npm run dev
```

Verify:
- Bell icon shows in header
- Unread count displays correctly
- Notification dropdown works
- Notification list page loads
- Mark as read works

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: complete notification system implementation"
```
