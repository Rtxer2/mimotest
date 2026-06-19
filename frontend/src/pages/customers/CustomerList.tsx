import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Modal, Form, Select, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { customerApi, Customer, CustomerCreate } from '../../api/customers';

const CustomerList = () => {
  const { t } = useTranslation();
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
      message.success(t('customers.create_success'));
      setModalOpen(false);
      form.resetFields();
      loadCustomers();
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      if (Array.isArray(detail)) {
        message.error(`${t('common.validation_error')}: ${detail.map((d: any) => `${d.loc?.join('.')}: ${d.msg}`).join('; ')}`);
      } else {
        message.error(`${t('customers.create_failed')}: ${detail || error?.message || t('common.unknown_error')}`);
      }
      console.error('Customer creation error:', error?.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: t('customers.code'), dataIndex: 'code', key: 'code' },
    { title: t('customers.name'), dataIndex: 'name', key: 'name' },
    { title: t('customers.country'), dataIndex: 'country', key: 'country' },
    { title: t('customers.email'), dataIndex: 'email', key: 'email' },
    { title: t('customers.phone'), dataIndex: 'phone', key: 'phone' },
    {
      title: t('customers.level'),
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag color={level === 'vip' ? 'gold' : level === 'important' ? 'blue' : 'default'}>
          {level === 'vip' ? t('customers.level_vip') : level === 'important' ? t('customers.level_important') : t('customers.level_normal')}
        </Tag>
      ),
    },
    {
      title: t('customers.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? t('common.active') : t('common.inactive')}</Tag>
      ),
    },
    {
      title: t('customers.action'),
      key: 'action',
      render: (_: any, record: Customer) => (
        <Button type="link" onClick={() => navigate(`/customers/${record.id}`)}>
          {t('customers.view')}
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
        <h2>{t('customers.title')}</h2>
        <Space>
          <Input
            placeholder={t('customers.search_placeholder')}
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            {t('customers.add_customer')}
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={filteredCustomers} loading={loading} rowKey="id" />

      <Modal
        title={t('customers.add_customer_modal')}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label={t('customers.name')} rules={[{ required: true, message: t('customers.name_required') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label={t('customers.code')} rules={[{ required: true, message: t('customers.code_required') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="level" label={t('customers.level')} initialValue="normal">
            <Select
              options={[
                { value: 'normal', label: t('customers.level_normal') },
                { value: 'important', label: t('customers.level_important') },
                { value: 'vip', label: t('customers.level_vip') },
              ]}
            />
          </Form.Item>
          <Form.Item name="country" label={t('customers.country')}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label={t('customers.email')}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label={t('customers.phone')}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label={t('customers.address')}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerList;
