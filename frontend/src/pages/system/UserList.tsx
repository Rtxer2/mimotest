import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, Switch, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { userApi, User, UserCreate } from '../../api/users';

const roleColors: Record<string, string> = {
  admin: 'red',
  manager: 'orange',
  operator: 'blue',
  viewer: 'default',
};

const UserList = () => {
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
      message.error('Failed to load users');
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
        message.success('User updated');
      } else {
        await userApi.create(values as UserCreate);
        message.success('User created');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await userApi.delete(id);
      message.success('User deleted');
      loadUsers();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || 'Failed to delete user');
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
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={roleColors[role] ?? 'default'}>{role.toUpperCase()}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>,
    },
    { title: 'Created', dataIndex: 'created_at', key: 'created_at', render: (t: string) => t?.slice(0, 19)?.replace('T', ' ') },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: User) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>Edit</Button>
          <Popconfirm title="Delete this user?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>User Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingUser(null); form.resetFields(); setModalOpen(true); }}
        >
          Add User
        </Button>
      </div>
      <Table columns={columns} dataSource={users} loading={loading} rowKey="id" />

      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingUser(null); }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="username" label="Username" rules={[{ required: !editingUser }]}>
            <Input disabled={!!editingUser} />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: !editingUser, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={editingUser ? [] : [{ required: true, min: 6 }]}
            extra={editingUser ? 'Leave blank to keep current password' : ''}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: !editingUser }]}>
            <Select
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'manager', label: 'Manager' },
                { value: 'operator', label: 'Operator' },
                { value: 'viewer', label: 'Viewer' },
              ]}
            />
          </Form.Item>
          {editingUser && (
            <Form.Item name="is_active" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;
