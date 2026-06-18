import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import { Notification } from '../../api/notifications';

const typeColors: Record<string, string> = {
  order: 'blue',
  production: 'orange',
  inventory: 'purple',
  quality: 'red',
  info: 'default',
};

const NotificationList = () => {
  const navigate = useNavigate();
  const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const columns = [
    {
      title: 'Status',
      key: 'status',
      width: 80,
      render: (_: any, record: Notification) => (
        <Tag color={record.is_read ? 'default' : 'green'}>
          {record.is_read ? 'Read' : 'Unread'}
        </Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => <Tag color={typeColors[type] || 'default'}>{type}</Tag>,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: 'Time',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (t: string) => new Date(t).toLocaleString(),
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_: any, record: Notification) => (
        <Space>
          {!record.is_read && (
            <Button
              size="small"
              icon={<CheckOutlined />}
              onClick={() => markAsRead(record.id)}
            >
              Read
            </Button>
          )}
          {record.link && (
            <Button
              size="small"
              type="link"
              onClick={() => {
                markAsRead(record.id);
                navigate(record.link);
              }}
            >
              View
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Notifications</h2>
        <Space>
          <Button
            type={filter === 'all' ? 'primary' : 'default'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            type={filter === 'unread' ? 'primary' : 'default'}
            onClick={() => setFilter('unread')}
          >
            Unread
          </Button>
          <Button icon={<CheckOutlined />} onClick={markAllAsRead}>
            Mark all read
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={filteredNotifications}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
};

export default NotificationList;
