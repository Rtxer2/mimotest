import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  InboxOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

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
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider width={250} theme="dark">
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: 20 }}>ERP System</h1>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['/production', '/inventory', '/quality']}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default Sidebar;