import { Layout, Button, Space, Select } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import i18n from '../i18n';

const { Content, Header } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { t } = useTranslation();

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
            <NotificationBell />
            <Select
              value={i18n.language}
              onChange={(value) => i18n.changeLanguage(value)}
              style={{ width: 120, marginRight: 16 }}
              options={[
                { value: 'zh', label: '中文' },
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' },
              ]}
            />
            <UserOutlined />
            <span>{user?.username || t('layout.unknown')} ({user?.role || '-'})</span>
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>{t('layout.logout')}</Button>
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
