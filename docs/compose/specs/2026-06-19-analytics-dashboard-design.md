# 数据大屏 (Analytics Dashboard) 设计规格

## [S1] 问题

当前 Dashboard 页面仅有 4 个简单统计卡片，缺乏全局业务可视化。用户需要一个数据大屏来一目了然地查看订单趋势、生产状态、库存概况、质量统计和审批进度。

## [S2] 解决方案

新建独立页面 `/analytics`，使用 recharts 图表库展示 7 个维度的业务数据。后端提供单个聚合 API，前端一次请求获取全部数据。

## [S3] 页面布局

响应式网格布局，3 行：

- **第 1 行**: 核心指标卡片（6 个）— 客户总数、订单总数、订单总金额、生产中工单、库存预警数、待审批数
- **第 2 行**: 订单趋势图（折线图，左 2/3）+ 订单状态分布（饼图，右 1/3）
- **第 3 行**: 生产工单统计（柱状图，左 1/3）+ 库存概览（柱状图，中 1/3）+ 质量+审批（右 1/3）

## [S4] 后端 API

`GET /api/v1/analytics/dashboard` — 无需参数，返回全部聚合数据。

响应结构：
```json
{
  "metrics": {
    "total_customers": 10,
    "total_orders": 50,
    "total_order_amount": 123456.00,
    "active_production_orders": 3,
    "low_stock_materials": 2,
    "pending_approvals": 2
  },
  "order_trend": [
    { "period": "2026-01", "count": 10, "amount": 25000.00 }
  ],
  "order_status_distribution": [
    { "status": "pending", "count": 5 }
  ],
  "production_stats": [
    { "status": "pending", "count": 2 },
    { "status": "in_progress", "count": 3 }
  ],
  "inventory_stats": {
    "total_materials": 20,
    "low_stock_materials": 2,
    "total_products": 15,
    "low_stock_products": 1
  },
  "quality_stats": {
    "total_inspections": 15,
    "passed": 12,
    "failed": 3,
    "open_issues": 2
  },
  "approval_stats": {
    "pending": 3,
    "approved": 10,
    "rejected": 1,
    "cancelled": 0
  }
}
```

## [S5] 前端组件

- `AnalyticsDashboard.tsx` — 主页面，使用 antd Row/Col 网格布局
- 依赖: `recharts` (LineChart, PieChart, BarChart)
- 所有图表使用中文标签
- 核心指标卡片使用 antd Statistic 组件 + 图标

## [S6] 路由和导航

- 路由: `/analytics` → `AnalyticsDashboard`
- 在 Sidebar 中新增"数据大屏"菜单项（可选，或替换现有 Dashboard 入口）

## [S7] 数据来源

所有数据从现有模型直接查询，不新增表：
- Customer, Order, OrderItem → 订单趋势、客户统计
- ProductionOrder → 生产统计
- Material, Product → 库存统计
- Inspection, QualityIssue → 质量统计
- ApprovalInstance → 审批统计
