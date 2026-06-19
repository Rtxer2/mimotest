from datetime import datetime
from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.order import Order
from app.models.production import ProductionOrder
from app.models.inventory import Material, FinishedProduct
from app.models.quality import QualityInspection, QualityIssue
from app.models.approval import ApprovalInstance


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard(self) -> dict:
        return {
            "metrics": self._get_metrics(),
            "order_trend": self._get_order_trend(),
            "order_status_distribution": self._get_order_status_distribution(),
            "production_stats": self._get_production_stats(),
            "inventory_stats": self._get_inventory_stats(),
            "quality_stats": self._get_quality_stats(),
            "approval_stats": self._get_approval_stats(),
        }

    def _get_metrics(self) -> dict:
        total_customers = self.db.query(func.count(Customer.id)).scalar() or 0
        total_orders = self.db.query(func.count(Order.id)).scalar() or 0
        total_order_amount = self.db.query(
            func.coalesce(func.sum(Order.total_amount), 0)
        ).scalar()
        active_production_orders = self.db.query(
            func.count(ProductionOrder.id)
        ).filter(
            ProductionOrder.status.in_(["pending", "in_progress"])
        ).scalar() or 0
        low_stock_materials = self.db.query(
            func.count(Material.id)
        ).filter(
            Material.safety_stock > 0,
            Material.current_stock < Material.safety_stock
        ).scalar() or 0
        pending_approvals = self.db.query(
            func.count(ApprovalInstance.id)
        ).filter(
            ApprovalInstance.status == "pending"
        ).scalar() or 0

        return {
            "total_customers": total_customers,
            "total_orders": total_orders,
            "total_order_amount": float(total_order_amount),
            "active_production_orders": active_production_orders,
            "low_stock_materials": low_stock_materials,
            "pending_approvals": pending_approvals,
        }

    def _get_order_trend(self) -> list[dict]:
        now = datetime.utcnow()
        start_year = now.year - (1 if now.month <= 11 else 0)
        start_month = (now.month - 11 - 1) % 12 + 1
        start = datetime(start_year, start_month, 1)

        rows = self.db.query(
            extract("year", Order.created_at).label("y"),
            extract("month", Order.created_at).label("m"),
            func.count(Order.id).label("count"),
            func.coalesce(func.sum(Order.total_amount), 0).label("amount"),
        ).filter(
            Order.created_at >= start
        ).group_by("y", "m").order_by("y", "m").all()

        result_map = {}
        for row in rows:
            period = f"{int(row.y):04d}-{int(row.m):02d}"
            result_map[period] = {
                "period": period,
                "count": row.count,
                "amount": float(row.amount),
            }

        trend = []
        for i in range(12):
            month_offset = i
            y = start.year + (start.month - 1 + month_offset) // 12
            m = (start.month - 1 + month_offset) % 12 + 1
            period = f"{y:04d}-{m:02d}"
            if period in result_map:
                trend.append(result_map[period])
            else:
                trend.append({"period": period, "count": 0, "amount": 0.0})

        return trend

    def _get_order_status_distribution(self) -> list[dict]:
        rows = self.db.query(
            Order.status,
            func.count(Order.id).label("count"),
        ).group_by(Order.status).all()

        return [{"status": row.status, "count": row.count} for row in rows]

    def _get_production_stats(self) -> list[dict]:
        rows = self.db.query(
            ProductionOrder.status,
            func.count(ProductionOrder.id).label("count"),
        ).group_by(ProductionOrder.status).all()

        return [{"status": row.status, "count": row.count} for row in rows]

    def _get_inventory_stats(self) -> dict:
        total_materials = self.db.query(func.count(Material.id)).scalar() or 0
        low_stock_materials = self.db.query(
            func.count(Material.id)
        ).filter(
            Material.safety_stock > 0,
            Material.current_stock < Material.safety_stock
        ).scalar() or 0
        total_products = self.db.query(func.count(FinishedProduct.id)).scalar() or 0
        low_stock_products = self.db.query(
            func.count(FinishedProduct.id)
        ).filter(
            FinishedProduct.safety_stock > 0,
            FinishedProduct.current_stock < FinishedProduct.safety_stock
        ).scalar() or 0

        return {
            "total_materials": total_materials,
            "low_stock_materials": low_stock_materials,
            "total_products": total_products,
            "low_stock_products": low_stock_products,
        }

    def _get_quality_stats(self) -> dict:
        total_inspections = self.db.query(
            func.count(QualityInspection.id)
        ).scalar() or 0
        passed = self.db.query(
            func.count(QualityInspection.id)
        ).filter(
            QualityInspection.result == "passed"
        ).scalar() or 0
        failed = self.db.query(
            func.count(QualityInspection.id)
        ).filter(
            QualityInspection.result == "failed"
        ).scalar() or 0
        open_issues = self.db.query(
            func.count(QualityIssue.id)
        ).filter(
            QualityIssue.status == "open"
        ).scalar() or 0

        return {
            "total_inspections": total_inspections,
            "passed": passed,
            "failed": failed,
            "open_issues": open_issues,
        }

    def _get_approval_stats(self) -> dict:
        rows = self.db.query(
            ApprovalInstance.status,
            func.count(ApprovalInstance.id).label("count"),
        ).group_by(ApprovalInstance.status).all()

        result = {"pending": 0, "approved": 0, "rejected": 0, "cancelled": 0}
        for row in rows:
            if row.status in result:
                result[row.status] = row.count
        return result
