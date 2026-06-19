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
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const { t } = useTranslation();

  const allMenuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: t('sidebar.dashboard'),
      permission: 'dashboard',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: t('sidebar.analytics'),
      permission: 'analytics',
    },
    {
      key: '/customers',
      icon: <UserOutlined />,
      label: t('sidebar.customers'),
      permission: 'customers',
      children: [
        { key: '/customers', label: t('customers.customer_list'), permission: 'customers' },
        { key: '/customers/analytics', label: t('customers.analytics'), permission: 'customers.analytics' },
      ],
    },
    {
      key: '/orders',
      icon: <ShoppingCartOutlined />,
      label: t('sidebar.orders'),
      permission: 'orders',
    },
    {
      key: '/production',
      icon: <ToolOutlined />,
      label: t('sidebar.production'),
      permission: 'production',
      children: [
        { key: '/production/dashboard', label: t('sidebar.production_dashboard'), permission: 'production' },
        { key: '/production/orders', label: t('sidebar.production_orders'), permission: 'production' },
      ],
    },
    {
      key: '/inventory',
      icon: <InboxOutlined />,
      label: t('sidebar.inventory'),
      permission: 'inventory',
      children: [
        { key: '/inventory/materials', label: t('sidebar.materials'), permission: 'inventory' },
        { key: '/inventory/products', label: t('sidebar.products'), permission: 'inventory' },
        { key: '/inventory/alerts', label: t('sidebar.inventory_alerts'), permission: 'inventory.alerts' },
      ],
    },
    {
      key: '/quality',
      icon: <CheckCircleOutlined />,
      label: t('sidebar.quality'),
      permission: 'quality',
      children: [
        { key: '/quality/inspections', label: t('sidebar.inspections'), permission: 'quality' },
        { key: '/quality/issues', label: t('sidebar.issues'), permission: 'quality' },
      ],
    },
    {
      key: '/approvals',
      icon: <AuditOutlined />,
      label: t('sidebar.approvals'),
      permission: 'approvals',
      children: [
        { key: '/approvals/pending', label: t('sidebar.pending_approvals'), permission: 'approvals' },
        { key: '/approvals/initiated', label: t('sidebar.initiated_approvals'), permission: 'approvals' },
        ...(hasPermission('approvals.flows') ? [{ key: '/approvals/flows', label: t('sidebar.flow_config'), permission: 'approvals.flows' }] : []),
      ],
    },
    {
      key: '/procurement',
      icon: <ShoppingOutlined />,
      label: t('procurement.title'),
      permission: 'procurement',
      children: [
        { key: '/procurement/suppliers', label: t('procurement.suppliers'), permission: 'procurement' },
        { key: '/procurement/requests', label: t('procurement.requests'), permission: 'procurement' },
        { key: '/procurement/orders', label: t('procurement.orders'), permission: 'procurement' },
        { key: '/procurement/returns', label: t('procurement.returns'), permission: 'procurement' },
      ],
    },
    {
      key: '/notifications',
      icon: <BellOutlined />,
      label: t('sidebar.notifications'),
      permission: 'notifications',
    },
    {
      key: '/system',
      icon: <SettingOutlined />,
      label: t('sidebar.system'),
      permission: 'system.dict',
      children: [
        ...(hasPermission('system.users') ? [{ key: '/system/users', label: t('sidebar.user_management'), permission: 'system.users' }] : []),
        { key: '/system/dict', label: t('sidebar.data_dictionary'), permission: 'system.dict' },
        { key: '/system/dashboard-config', label: t('sidebar.dashboard_config'), permission: 'system.dashboard_config' },
        { key: '/system/reports', label: t('sidebar.report_export'), permission: 'system.reports' },
      ],
    },
  ];

  const filterItems = (items: any[]): any[] => {
    return items
      .filter((item) => hasPermission(item.permission))
      .map((item) => {
        if (item.children) {
          const filteredChildren = filterItems(item.children);
          if (filteredChildren.length === 0) return null;
          return { ...item, children: filteredChildren };
        }
        return item;
      })
      .filter(Boolean);
  };

  const menuItems = filterItems(allMenuItems);

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
