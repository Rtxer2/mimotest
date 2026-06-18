import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Modal, Form, Select, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { customerApi, Customer, CustomerCreate } from '../../api/customers';

const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerApi.list({ limit: 100 });
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreate = async (values: CustomerCreate) => {
    setSubmitting(true);
    try {
      await customerApi.create(values);
      message.success('Customer created successfully');
      setModalOpen(false);
      form.resetFields();
      loadCustomers();
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      if (Array.isArray(detail)) {
        message.error(`Validation error: ${detail.map((d: any) => `${d.loc?.join('.')}: ${d.msg}`).join('; ')}`);
      } else {
        message.error(`Failed to create customer: ${detail || error?.message || 'Unknown error'}`);
      }
      console.error('Customer creation error:', error?.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Country', dataIndex: 'country', key: 'country' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag color={level === 'vip' ? 'gold' : level === 'important' ? 'blue' : 'default'}>
          {level.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Customer) => (
        <Button type="link" onClick={() => navigate(`/customers/${record.id}`)}>
          View
        </Button>
      ),
    },
  ];

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Customers</h2>
        <Space>
          <Input
            placeholder="Search customers..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Add Customer
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={filteredCustomers} loading={loading} rowKey="id" />

      <Modal
        title="Add Customer"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter customer name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Please enter customer code' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="level" label="Level" initialValue="normal">
            <Select
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'important', label: 'Important' },
                { value: 'vip', label: 'VIP' },
              ]}
            />
          </Form.Item>
          <Form.Item name="country" label="Country">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerList;
