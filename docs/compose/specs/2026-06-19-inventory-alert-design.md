# 库存预警功能设计规格

## [S1] 问题

库存低于安全库存时缺乏专门的预警视图和管理入口。需要预警页面、页面标识和自动通知。

## [S2] 解决方案

1. 后端新增 `/inventory/alerts` API 返回低库存物料和成品
2. 前端新增预警页面 `/inventory/alerts`
3. MaterialList/ProductList 低库存行加红色背景
4. 库存变动时自动检查并通知（原材料已有，补充成品）

## [S3] 后端 API

`GET /api/v1/inventory/alerts` 返回：
```json
{
  "materials": [{ "id": 1, "name": "...", "code": "...", "current_stock": 5, "safety_stock": 10 }],
  "products": [{ "id": 1, "product_name": "...", "sku": "...", "current_stock": 3, "safety_stock": 8 }]
}
```
条件：`safety_stock > 0 AND current_stock < safety_stock`

## [S4] 前端页面

- 路由: `/inventory/alerts`
- 两个 Tab：原材料预警、成品预警
- 表格显示低库存项，红色标识
- 侧边栏 Inventory 菜单下新增"库存预警"

## [S5] 库存页面标识

MaterialList 和 ProductList 中，低于安全库存的行加 `style={{ background: '#fff2f0' }}`

## [S6] 自动通知

`create_transaction` 中，成品出库后也检查低库存并发送通知（原材料已有）
