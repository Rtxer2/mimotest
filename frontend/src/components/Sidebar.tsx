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
        defaultOpenKeys={['/production', '/inventory', '/quality', '/system']}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default Sidebar;
