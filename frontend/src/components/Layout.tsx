import { Layout, Button, Space } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import Sidebar from './Sidebar';

const { Content, Header } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <Space>
            <UserOutlined />
            <span>{user?.username || 'Unknown'} ({user?.role || '-'})</span>
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>Logout</Button>
          </Space>
        </Header>
        <Content style={{ padding: '24px', background: '#f5f5f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
