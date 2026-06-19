# Dashboard 配置功能设计规格

## [S1] 问题

用户无法自定义 Dashboard 和数据大屏的显示内容。需要在系统设置中添加配置页面，让用户自由选择显示哪些模块。

## [S2] 解决方案

新增 `user_preferences` 表存储用户级配置。提供 API 读写配置。在系统设置中新增"仪表盘配置"页面，用 Switch 控制每个模块。两个 Dashboard 页面根据配置条件渲染。

## [S3] 数据存储

新增 `user_preferences` 表：
- `id` (PK)
- `user_id` (FK → users.id, unique)
- `dashboard_config` (JSON)
- `created_at`, `updated_at`

dashboard_config JSON 结构：
```json
{
  "dashboard": {
    "customers": true,
    "orders": true,
    "production": true,
    "quality": true
  },
  "analytics": {
    "metrics": true,
    "order_trend": true,
    "order_status": true,
    "production_stats": true,
    "inventory_stats": true,
    "quality_stats": true,
    "approval_stats": true
  }
}
```

默认值：所有字段为 true（全部显示）。

## [S4] API

- `GET /api/v1/users/me/preferences` — 返回当前用户的 dashboard_config
- `PUT /api/v1/users/me/preferences` — 更新 dashboard_config

如果用户没有配置记录，返回默认值（全部 true）。

## [S5] 前端配置页面

路由: `/system/dashboard-config`
- 使用 antd Switch 组件
- 分两组：首页 Dashboard（4 个开关）和 数据大屏（7 个开关）
- 保存时调用 PUT API

## [S6] Dashboard 条件渲染

- `Dashboard.tsx` 读取配置，隐藏关闭的 Statistic 卡片
- `AnalyticsDashboard.tsx` 读取配置，隐藏关闭的指标卡片和图表区域
- 配置加载前显示 loading，加载后按配置渲染
