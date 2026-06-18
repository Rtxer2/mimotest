# Approval Workflow System Design Specification

## [S1] Overall Architecture

**Core Components:**
- `ApprovalFlow` model - approval flow configuration (defines which documents need approval)
- `ApprovalNode` model - approval node configuration (each flow's approval levels)
- `ApprovalInstance` model - approval instance (each approval record)
- `ApprovalRecord` model - approval record (each node's approval result)
- `ApprovalService` - approval business logic
- `/api/v1/approvals` API - approval related endpoints
- Frontend approval pages - pending approvals, my initiated, approval details

**Data Flow:**
1. User creates order/production order/document
2. System checks if approval is needed (based on configuration)
3. If approval needed, create approval instance and first approval node record
4. Approver receives notification and makes decision
5. After approval, automatically proceed to next node
6. After all nodes approved, document status changes to "approved"

## [S2] Database Design

**Approval Flow Configuration Table `approval_flows`:**
- `name` - flow name (e.g., "Order Approval Flow")
- `business_type` - business type (order/production/purchase)
- `trigger_condition` - trigger condition (JSON, e.g., {"min_amount": 10000})
- `is_active` - whether enabled

**Approval Node Table `approval_nodes`:**
- `flow_id` - associated flow ID
- `node_order` - node order (1, 2, 3...)
- `node_name` - node name (e.g., "Department Manager Approval")
- `approver_type` - approver type (role/user)
- `approver_value` - approver value (role name or user ID)
- `action_on_reject` - reject action (reject_to_start/reject_to_prev)

**Approval Instance Table `approval_instances`:**
- `flow_id` - associated flow ID
- `business_type` - business type
- `business_id` - business document ID
- `initiator_id` - initiator ID
- `status` - status (pending/approved/rejected/cancelled)
- `current_node_order` - current node order

**Approval Record Table `approval_records`:**
- `instance_id` - associated instance ID
- `node_id` - associated node ID
- `approver_id` - approver ID
- `action` - action (approve/reject)
- `comment` - approval comment

## [S3] API Design

**Approval Flow Management API (admin):**
```
GET    /approval-flows              # Get flows list
POST   /approval-flows              # Create flow
GET    /approval-flows/{id}         # Get flow details (with nodes)
PUT    /approval-flows/{id}         # Update flow
DELETE /approval-flows/{id}         # Delete flow
POST   /approval-flows/{id}/nodes   # Add approval node
PUT    /approval-flows/{id}/nodes/{node_id}  # Update node
DELETE /approval-flows/{id}/nodes/{node_id}  # Delete node
```

**Approval Operation API:**
```
GET    /approvals/pending           # Get pending approvals for me
GET    /approvals/initiated         # Get approvals I initiated
GET    /approvals/{instance_id}     # Get approval details
POST   /approvals/{instance_id}/approve  # Approve
POST   /approvals/{instance_id}/reject   # Reject
POST   /approvals/{instance_id}/cancel   # Cancel approval
```

## [S4] Frontend Design

**Sidebar:**
- Add "Approval Management" menu item
  - Pending Approvals
  - My Initiated
  - Approval Flow Configuration (admin only)

**Pending Approvals Page `/approvals/pending`:**
- Pending approval list (paginated)
- Display: business type, document number, initiator, initiation time
- Actions: approve, reject

**My Initiated Page `/approvals/initiated`:**
- My initiated approval list (paginated)
- Display: business type, document number, current status, current approval node
- Actions: cancel approval (only for pending status)

**Approval Details Page `/approvals/:id`:**
- Approval basic information
- Approval flow diagram (show all nodes and current progress)
- Approval record list
- Action buttons (approve/reject, only visible to current node approver)

**Approval Flow Configuration Page `/approvals/flows` (admin only):**
- Flow list
- Create/edit flow
- Configure approval nodes (drag to reorder)

## [S5] Approval Scenarios

### Order Approval
- Trigger: order amount exceeds threshold (configurable)
- Flow: Sales → Department Manager → General Manager
- Reject action: reject to start

### Production Order Approval
- Trigger: production order creation
- Flow: Production Supervisor → Quality Manager
- Reject action: reject to previous

### Purchase Approval
- Trigger: purchase amount exceeds threshold
- Flow: Purchaser → Department Manager → Finance → General Manager
- Reject action: reject to start

## [S6] Implementation Approach

**Simple Multi-Level Approval:**
- Use approval flow configuration table to define approval levels
- Each approval node supports role or specified personnel
- Simple and direct, easy to understand and maintain
- No additional dependencies required

**Service Layer Integration:**
- Add approval checks in existing Service methods
- When creating documents, check if approval is needed
- After approval, update document status
