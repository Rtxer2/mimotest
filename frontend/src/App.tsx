import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import CustomerList from './pages/customers/CustomerList';
import CustomerDetail from './pages/customers/CustomerDetail';
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';
import CreateOrder from './pages/orders/CreateOrder';
import ProductionDashboard from './pages/production/Dashboard';
import ProductionOrderList from './pages/production/OrderList';
import ProductionOrderDetail from './pages/production/OrderDetail';
import MaterialList from './pages/inventory/MaterialList';
import ProductList from './pages/inventory/ProductList';
import InventoryAlerts from './pages/inventory/InventoryAlerts';
import InspectionList from './pages/quality/InspectionList';
import IssueList from './pages/quality/IssueList';
import DictList from './pages/system/DictList';
import UserList from './pages/system/UserList';
import NotificationList from './pages/notifications/NotificationList';
import PendingList from './pages/approvals/PendingList';
import InitiatedList from './pages/approvals/InitiatedList';
import ApprovalDetail from './pages/approvals/ApprovalDetail';
import FlowConfig from './pages/approvals/FlowConfig';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import DashboardConfigPage from './pages/system/DashboardConfig';
import ReportExport from './pages/system/ReportExport';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/create" element={<CreateOrder />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="production/dashboard" element={<ProductionDashboard />} />
        <Route path="production/orders" element={<ProductionOrderList />} />
        <Route path="production/orders/:id" element={<ProductionOrderDetail />} />
        <Route path="inventory/materials" element={<MaterialList />} />
        <Route path="inventory/products" element={<ProductList />} />
        <Route path="inventory/alerts" element={<InventoryAlerts />} />
        <Route path="quality/inspections" element={<InspectionList />} />
        <Route path="quality/issues" element={<IssueList />} />
        <Route path="system/dict" element={<DictList />} />
        <Route path="system/users" element={<UserList />} />
        <Route path="system/dashboard-config" element={<DashboardConfigPage />} />
        <Route path="system/reports" element={<ReportExport />} />
        <Route path="notifications" element={<NotificationList />} />
        <Route path="approvals/pending" element={<PendingList />} />
        <Route path="approvals/initiated" element={<InitiatedList />} />
        <Route path="approvals/flows" element={<FlowConfig />} />
        <Route path="approvals/:id" element={<ApprovalDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;