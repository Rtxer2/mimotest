# 采购管理模块设计规格

## [S1] 问题

系统缺乏采购流程管理，无法管理供应商、采购申请、采购订单和入库操作。

## [S2] 解决方案

新建采购管理模块，包含供应商管理、采购申请、审批集成、采购订单、入库操作。采购入库自动更新库存。

## [S3] 数据模型

### Supplier（供应商）
- name, contact_person, phone, email, address, status(active/inactive)

### PurchaseRequest（采购申请）
- request_no (UUID), supplier_id (FK), status (draft/pending_approval/approved/rejected/completed), total_amount, remarks, initiator_id

### PurchaseRequestItem（申请明细）
- request_id (FK), material_id (FK), quantity, unit_price

### PurchaseOrder（采购订单）
- order_no (UUID), request_id (FK, nullable), supplier_id (FK), status (pending/ordered/received/cancelled), total_amount, delivery_date, remarks

### PurchaseOrderItem（订单明细）
- order_id (FK), material_id (FK), quantity, unit_price, received_quantity (default 0)

## [S4] 采购流程

1. 创建采购申请（选择供应商 + 物料明细）
2. 提交审批（复用审批工作流，business_type="purchase"）
3. 审批通过后生成采购订单
4. 采购入库：登记到货数量 → 自动更新 Material.current_stock
5. 所有明细收到后，订单状态变为 received

## [S5] API 端点

- `/api/v1/procurement/suppliers` — CRUD
- `/api/v1/procurement/requests` — CRUD + submit-approval
- `/api/v1/procurement/orders` — CRUD + receive (入库)

## [S6] 前端页面

- `/procurement/suppliers` — 供应商列表（CRUD）
- `/procurement/requests` — 采购申请列表 + 创建
- `/procurement/orders` — 采购订单列表 + 入库操作
- 侧边栏"采购管理"菜单

## [S7] i18n

所有新增文本需添加 zh/en/es 翻译。
