import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      title: t('notifications.status'),
      key: 'status',
      width: 80,
      render: (_: any, record: Notification) => (
        <Tag color={record.is_read ? 'default' : 'green'}>
          {record.is_read ? t('notifications.read') : t('notifications.unread')}
        </Tag>
      ),
    },
    {
      title: t('notifications.type'),
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => <Tag color={typeColors[type] || 'default'}>{type}</Tag>,
    },
    {
      title: t('notifications.notification_title'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('notifications.content'),
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: t('notifications.time'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: t('notifications.action'),
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
              {t('notifications.read')}
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
              {t('notifications.view')}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>{t('notifications.title')}</h2>
        <Space>
          <Button
            type={filter === 'all' ? 'primary' : 'default'}
            onClick={() => setFilter('all')}
          >
            {t('notifications.filter_all')}
          </Button>
          <Button
            type={filter === 'unread' ? 'primary' : 'default'}
            onClick={() => setFilter('unread')}
          >
            {t('notifications.filter_unread')}
          </Button>
          <Button icon={<CheckOutlined />} onClick={markAllAsRead}>
            {t('notifications.mark_all_read')}
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
