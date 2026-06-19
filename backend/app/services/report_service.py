import io
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem
from app.models.production import ProductionOrder
from app.models.quality import QualityInspection, QualityIssue
from app.models.inventory import Material, FinishedProduct
from app.models.customer import Customer


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def export_orders_xlsx(self):
        from openpyxl import Workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "订单报表"
        ws.append(["订单号", "客户ID", "状态", "总金额", "交货日期", "创建时间"])
        orders = self.db.query(Order).order_by(Order.created_at.desc()).all()
        for o in orders:
            ws.append([o.order_no, o.customer_id, o.status, float(o.total_amount or 0), str(o.delivery_date or ""), str(o.created_at or "")])
        buf = io.BytesIO()
        wb.save(buf)
        buf.seek(0)
        return buf

    def export_orders_pdf(self):
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
        from reportlab.lib import colors
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=landscape(A4))
        orders = self.db.query(Order).order_by(Order.created_at.desc()).all()
        data = [["订单号", "客户ID", "状态", "总金额", "交货日期", "创建时间"]]
        for o in orders:
            data.append([o.order_no, o.customer_id, o.status, str(float(o.total_amount or 0)), str(o.delivery_date or "")[:10], str(o.created_at or "")[:10]])
        t = Table(data)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ]))
        doc.build([t])
        buf.seek(0)
        return buf

    def export_production_xlsx(self):
        from openpyxl import Workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "生产报表"
        ws.append(["工单ID", "关联订单ID", "状态", "车间", "计划开始", "计划结束"])
        orders = self.db.query(ProductionOrder).all()
        for o in orders:
            ws.append([o.id, o.order_id, o.status, o.assigned_workshop or "", str(o.planned_start or ""), str(o.planned_end or "")])
        buf = io.BytesIO()
        wb.save(buf)
        buf.seek(0)
        return buf

    def export_production_pdf(self):
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
        from reportlab.lib import colors
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=landscape(A4))
        orders = self.db.query(ProductionOrder).all()
        data = [["工单ID", "关联订单ID", "状态", "车间", "计划开始", "计划结束"]]
        for o in orders:
            data.append([str(o.id), str(o.order_id), o.status, o.assigned_workshop or "", str(o.planned_start or "")[:10], str(o.planned_end or "")[:10]])
        t = Table(data)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ]))
        doc.build([t])
        buf.seek(0)
        return buf

    def export_quality_xlsx(self):
        from openpyxl import Workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "质量报表"
        ws.append(["检验ID", "检验类型", "结果", "检验员", "检验时间", "问题数"])
        inspections = self.db.query(QualityInspection).all()
        for i in inspections:
            issue_count = self.db.query(QualityIssue).filter(QualityIssue.inspection_id == i.id).count()
            ws.append([i.id, i.inspection_type, i.result, i.inspector or "", str(i.inspect_time or ""), issue_count])
        buf = io.BytesIO()
        wb.save(buf)
        buf.seek(0)
        return buf

    def export_quality_pdf(self):
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
        from reportlab.lib import colors
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=landscape(A4))
        inspections = self.db.query(QualityInspection).all()
        data = [["检验ID", "检验类型", "结果", "检验员", "检验时间", "问题数"]]
        for i in inspections:
            issue_count = self.db.query(QualityIssue).filter(QualityIssue.inspection_id == i.id).count()
            data.append([str(i.id), i.inspection_type, i.result, i.inspector or "", str(i.inspect_time or "")[:10], str(issue_count)])
        t = Table(data)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ]))
        doc.build([t])
        buf.seek(0)
        return buf

    def export_inventory_xlsx(self):
        from openpyxl import Workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "库存报表"
        ws.append(["物料编码", "名称", "单位", "当前库存", "安全库存"])
        materials = self.db.query(Material).all()
        for m in materials:
            ws.append([m.code, m.name, m.unit, float(m.current_stock or 0), float(m.safety_stock or 0)])
        ws2 = wb.create_sheet("成品库存")
        ws2.append(["SKU", "名称", "当前库存", "安全库存", "分类"])
        products = self.db.query(FinishedProduct).all()
        for p in products:
            ws2.append([p.sku, p.product_name, p.current_stock, p.safety_stock, p.category or ""])
        buf = io.BytesIO()
        wb.save(buf)
        buf.seek(0)
        return buf

    def export_inventory_pdf(self):
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
        from reportlab.lib import colors
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=landscape(A4))
        materials = self.db.query(Material).all()
        data = [["物料编码", "名称", "单位", "当前库存", "安全库存"]]
        for m in materials:
            data.append([m.code, m.name, m.unit, str(float(m.current_stock or 0)), str(float(m.safety_stock or 0))])
        t = Table(data)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ]))
        doc.build([t])
        buf.seek(0)
        return buf

    def export(self, report_type: str, format: str):
        method_name = f"export_{report_type}_{format}"
        method = getattr(self, method_name, None)
        if not method:
            raise ValueError(f"Unsupported: {report_type}.{format}")
        return method()
