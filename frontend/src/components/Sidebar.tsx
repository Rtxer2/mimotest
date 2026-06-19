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
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRole = useAuthStore((state) => state.hasRole);

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: '数据大屏',
    },
    {
      key: '/customers',
      icon: <UserOutlined />,
      label: 'Customers',
    },
    {
      key: '/orders',
      icon: <ShoppingCartOutlined />,
      label: 'Orders',
    },
    {
      key: '/production',
      icon: <ToolOutlined />,
      label: 'Production',
      children: [
        { key: '/production/dashboard', label: 'Dashboard' },
        { key: '/production/orders', label: 'Orders' },
      ],
    },
    {
      key: '/inventory',
      icon: <InboxOutlined />,
      label: 'Inventory',
      children: [
        { key: '/inventory/materials', label: 'Materials' },
        { key: '/inventory/products', label: 'Products' },
      ],
    },
    {
      key: '/quality',
      icon: <CheckCircleOutlined />,
      label: 'Quality',
      children: [
        { key: '/quality/inspections', label: 'Inspections' },
        { key: '/quality/issues', label: 'Issues' },
      ],
    },
    {
      key: '/approvals',
      icon: <AuditOutlined />,
      label: '审批管理',
      children: [
        { key: '/approvals/pending', label: '待我审批' },
        { key: '/approvals/initiated', label: '我发起的' },
        ...(hasRole('admin') ? [{ key: '/approvals/flows', label: '流程配置' }] : []),
      ],
    },
    {
      key: '/notifications',
      icon: <BellOutlined />,
      label: 'Notifications',
    },
    {
      key: '/system',
      icon: <SettingOutlined />,
      label: 'System',
      children: [
        ...(hasRole('admin') ? [{ key: '/system/users', label: 'User Management' }] : []),
        { key: '/system/dict', label: 'Data Dictionary' },
        { key: '/system/dashboard-config', label: '仪表盘配置' },
      ],
    },
  ];

  return (
    <Sider width={250} theme="dark">
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: 20 }}>ERP System</h1>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['/production', '/inventory', '/quality', '/system', '/approvals']}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default Sidebar;
