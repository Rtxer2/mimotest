import { useEffect } from 'react';
import { Badge, Dropdown, List, Button, Typography, Empty } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../store/notificationStore';

const { Text } = Typography;

const NotificationBell = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    startPolling,
    stopPolling,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    startPolling();
    return () => stopPolling();
  }, []);

  const handleClick = async (id: number, link: string) => {
    await markAsRead(id);
    if (link) {
      navigate(link);
    }
  };

  const dropdownContent = (
    <div style={{ width: 360, background: 'white', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>Notifications</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" icon={<CheckOutlined />} onClick={markAllAsRead}>
            Mark all read
          </Button>
        )}
      </div>
      <div style={{ maxHeight: 400, overflow: 'auto' }}>
        {notifications.length === 0 ? (
          <Empty description="No notifications" style={{ padding: '24px 0' }} />
        ) : (
          <List
            dataSource={notifications.slice(0, 10)}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  background: item.is_read ? 'transparent' : '#f6ffed',
                }}
                onClick={() => handleClick(item.id, item.link)}
              >
                <List.Item.Meta
                  title={<Text strong={!item.is_read}>{item.title}</Text>}
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.content}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {new Date(item.created_at).toLocaleString()}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
      <div style={{ padding: '8px 16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
        <Button type="link" onClick={() => navigate('/notifications')}>
          View all notifications
        </Button>
      </div>
    </div>
  );

  return (
    <Dropdown dropdownRender={() => dropdownContent} trigger={['click']} placement="bottomRight">
      <Badge count={unreadCount} size="small">
        <Button type="text" icon={<BellOutlined />} style={{ fontSize: 18 }} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
