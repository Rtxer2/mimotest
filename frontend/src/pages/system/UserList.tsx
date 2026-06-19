import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, Switch, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { userApi, User, UserCreate } from '../../api/users';

const roleColors: Record<string, string> = {
  admin: 'red',
  manager: 'orange',
  operator: 'blue',
  viewer: 'default',
};

const UserList = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.list({ limit: 100 });
      setUsers(res.data);
    } catch (error) {
      message.error(t('system.load_users_failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSave = async (values: any) => {
    setSubmitting(true);
    try {
      if (editingUser) {
        const updateData: any = { ...values };
        if (!updateData.password) delete updateData.password;
        await userApi.update(editingUser.id, updateData);
        message.success(t('system.user_updated'));
      } else {
        await userApi.create(values as UserCreate);
        message.success(t('system.user_created'));
      }
      setModalOpen(false);
      form.resetFields();
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await userApi.delete(id);
      message.success(t('system.user_deleted'));
      loadUsers();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('system.delete_user_failed'));
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    });
    setModalOpen(true);
  };

  const columns = [
    { title: t('system.username'), dataIndex: 'username', key: 'username' },
    { title: t('system.email'), dataIndex: 'email', key: 'email' },
    {
      title: t('system.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={roleColors[role] ?? 'default'}>{role.toUpperCase()}</Tag>,
    },
    {
      title: t('system.status'),
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? t('system.active') : t('system.status_inactive')}</Tag>,
    },
    { title: t('system.created'), dataIndex: 'created_at', key: 'created_at', render: (val: string) => val?.slice(0, 19)?.replace('T', ' ') },
    {
      title: t('system.action'),
      key: 'action',
      render: (_: any, record: User) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>{t('system.edit')}</Button>
          <Popconfirm title={t('system.delete_confirm')} onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>{t('system.delete')}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>{t('system.user_management_title')}</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingUser(null); form.resetFields(); setModalOpen(true); }}
        >
          {t('system.add_user')}
        </Button>
      </div>
      <Table columns={columns} dataSource={users} loading={loading} rowKey="id" />

      <Modal
        title={editingUser ? t('system.edit_user') : t('system.add_user')}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingUser(null); }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="username" label={t('system.username')} rules={[{ required: !editingUser }]}>
            <Input disabled={!!editingUser} />
          </Form.Item>
          <Form.Item name="email" label={t('system.email')} rules={[{ required: !editingUser, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('system.password')}
            rules={editingUser ? [] : [{ required: true, min: 6 }]}
            extra={editingUser ? t('system.password_help') : ''}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label={t('system.role')} rules={[{ required: !editingUser }]}>
            <Select
              options={[
                { value: 'admin', label: t('system.role_admin') },
                { value: 'manager', label: t('system.role_manager') },
                { value: 'operator', label: t('system.role_operator') },
                { value: 'viewer', label: t('system.role_viewer') },
              ]}
            />
          </Form.Item>
          {editingUser && (
            <Form.Item name="is_active" label={t('system.active')} valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;
