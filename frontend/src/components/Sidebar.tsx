import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  BellOutlined,
  AuditOutlined,
  BarChartOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRole = useAuthStore((state) => state.hasRole);
  const { t } = useTranslation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: t('sidebar.dashboard'),
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: t('sidebar.analytics'),
    },
    {
      key: '/customers',
      icon: <UserOutlined />,
      label: t('sidebar.customers'),
      children: [
        { key: '/customers', label: t('customers.customer_list') },
        { key: '/customers/analytics', label: t('customers.analytics') },
      ],
    },
    {
      key: '/orders',
      icon: <ShoppingCartOutlined />,
      label: t('sidebar.orders'),
    },
    {
      key: '/production',
      icon: <ToolOutlined />,
      label: t('sidebar.production'),
      children: [
        { key: '/production/dashboard', label: t('sidebar.production_dashboard') },
        { key: '/production/orders', label: t('sidebar.production_orders') },
      ],
    },
    {
      key: '/inventory',
      icon: <InboxOutlined />,
      label: t('sidebar.inventory'),
      children: [
        { key: '/inventory/materials', label: t('sidebar.materials') },
        { key: '/inventory/products', label: t('sidebar.products') },
        { key: '/inventory/alerts', label: t('sidebar.inventory_alerts') },
      ],
    },
    {
      key: '/quality',
      icon: <CheckCircleOutlined />,
      label: t('sidebar.quality'),
      children: [
        { key: '/quality/inspections', label: t('sidebar.inspections') },
        { key: '/quality/issues', label: t('sidebar.issues') },
      ],
    },
    {
      key: '/approvals',
      icon: <AuditOutlined />,
      label: t('sidebar.approvals'),
      children: [
        { key: '/approvals/pending', label: t('sidebar.pending_approvals') },
        { key: '/approvals/initiated', label: t('sidebar.initiated_approvals') },
        ...(hasRole('admin') ? [{ key: '/approvals/flows', label: t('sidebar.flow_config') }] : []),
      ],
    },
    {
      key: '/procurement',
      icon: <ShoppingOutlined />,
      label: t('procurement.title'),
      children: [
        { key: '/procurement/suppliers', label: t('procurement.suppliers') },
        { key: '/procurement/requests', label: t('procurement.requests') },
        { key: '/procurement/orders', label: t('procurement.orders') },
        { key: '/procurement/returns', label: t('procurement.returns') },
      ],
    },
    {
      key: '/notifications',
      icon: <BellOutlined />,
      label: t('sidebar.notifications'),
    },
    {
      key: '/system',
      icon: <SettingOutlined />,
      label: t('sidebar.system'),
      children: [
        ...(hasRole('admin') ? [{ key: '/system/users', label: t('sidebar.user_management') }] : []),
        { key: '/system/dict', label: t('sidebar.data_dictionary') },
        { key: '/system/dashboard-config', label: t('sidebar.dashboard_config') },
        { key: '/system/reports', label: t('sidebar.report_export') },
      ],
    },
  ];

  return (
    <Sider width={250} theme="dark">
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: 20 }}>{t('sidebar.erp_system')}</h1>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['/production', '/inventory', '/quality', '/system', '/approvals', '/procurement']}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default Sidebar;
