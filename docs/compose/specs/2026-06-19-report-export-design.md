# 报表导出功能设计规格

## [S1] 问题

系统无法导出业务数据为 Excel 或 PDF 文件，用户需要离线查看和分享报表。

## [S2] 解决方案

后端新增报表导出 API，使用 openpyxl 生成 Excel、reportlab 生成 PDF。前端提供导出页面和各模块导出按钮。

## [S3] 后端 API

`GET /api/v1/reports/export` 参数：
- `type`: orders / production / quality / inventory
- `format`: xlsx / pdf

返回文件流（StreamingResponse），Content-Disposition 触发浏览器下载。

## [S4] 报表内容

- **订单报表**: 订单号、客户、状态、总金额、交货日期、创建时间
- **生产报表**: 工单号、关联订单、状态、车间、计划开始/结束
- **质量报表**: 检验类型、检验结果、检验员、检验时间、问题数
- **库存报表**: 物料编码、名称、单位、当前库存、安全库存

## [S5] 前端

- 系统设置新增"报表导出"页面 `/system/reports`
- 各模块列表页表格上方加"导出 Excel"/"导出 PDF"按钮
- 下载通过创建临时 `<a>` 标签触发

## [S6] 依赖

- 后端: `openpyxl`, `reportlab`
- 前端: 无新增依赖
