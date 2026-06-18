# Notification System Design Specification

## [S1] Overall Architecture

**Core Components:**
- `Notification` model (existing) - stores notification data
- `NotificationService` - notification creation and query logic
- `NotificationRule` model - notification rule configuration (who receives what)
- `/api/v1/notifications` API - notification query and mark as read
- Frontend `NotificationBell` component - unread message reminder
- Frontend `NotificationList` page - message list

**Data Flow:**
1. Order/Production/Inventory/Quality module performs an operation
2. Service layer calls `NotificationService.create_notification()`
3. Determine recipients based on `NotificationRule`
4. Create notification record in database
5. Frontend polls for unread notification count

## [S2] Database Design

**Notifications Table (existing):**
- `user_id` - recipient user ID
- `title` - notification title
- `content` - notification content
- `type` - notification type (order/production/inventory/quality)
- `is_read` - read status
- `link` - associated page link

**New Notification Rules Table `notification_rules`:**
- `event_type` - event type (order_created, order_status_changed, production_updated, inventory_low, quality_issue)
- `role` - recipient role (admin/manager/operator/viewer)
- `user_id` - specified recipient (optional, higher priority than role)
- `is_active` - whether enabled

**Example Rules:**
| event_type | role | Description |
|------------|------|-------------|
| order_created | manager | New order notifies manager |
| order_status_changed | operator | Order status change notifies operator |
| inventory_low | manager | Low inventory alert notifies manager |
| quality_issue | manager | Quality issue notifies manager |

## [S3] API Design

**Notification API:**
```
GET  /notifications              # Get current user's notification list
GET  /notifications/unread-count # Get unread notification count
PUT  /notifications/{id}/read    # Mark single notification as read
PUT  /notifications/read-all     # Mark all notifications as read
```

**Notification Rules API (admin only):**
```
GET    /notification-rules       # Get rules list
POST   /notification-rules       # Create rule
PUT    /notification-rules/{id}  # Update rule
DELETE /notification-rules/{id}  # Delete rule
```

## [S4] Frontend Design

**Top Navigation Bar:**
- Bell icon + unread count badge
- Click to show recent 10 notifications dropdown
- "View All" link to notification list page

**Notification List Page `/notifications`:**
- Notification list (paginated)
- Filter by type, read/unread
- Batch mark as read
- Click notification to navigate to associated page

**Sidebar:**
- Add "Message Center" menu item (under System Management)

## [S5] Notification Scenarios

### Order Notifications
- `order_created`: When a new order is created, notify managers
- `order_status_changed`: When order status changes, notify operators and related personnel

### Production Notifications
- `production_created`: When a production order is created, notify production team
- `production_stage_completed`: When a production stage is completed, notify managers

### Inventory Notifications
- `inventory_low`: When inventory falls below safety stock, notify warehouse managers
- `transaction_created`: When stock in/out occurs, notify managers

### Quality Notifications
- `quality_issue_created`: When a quality issue is found, notify quality manager and production manager

## [S6] Implementation Approach

**Service Layer Hooks:**
- Add notification calls in existing Service methods
- Simple and direct, consistent with existing code style
- No additional dependencies required

**Notification Service Interface:**
```python
class NotificationService:
    def create_notification(self, event_type: str, title: str, content: str, link: str = "")
    def get_user_notifications(self, user_id: int, skip: int = 0, limit: int = 20)
    def get_unread_count(self, user_id: int)
    def mark_as_read(self, notification_id: int, user_id: int)
    def mark_all_as_read(self, user_id: int)
```
