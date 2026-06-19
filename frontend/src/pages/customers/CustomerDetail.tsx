import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { customerApi, Customer, Contact, FollowUp } from '../../api/customers';

const CustomerDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer & { contacts: Contact[]; follow_ups: FollowUp[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [followUpModalVisible, setFollowUpModalVisible] = useState(false);
  const [contactForm] = Form.useForm();
  const [followUpForm] = Form.useForm();

  const loadCustomer = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await customerApi.get(parseInt(id));
      setCustomer(response.data);
    } catch (error) {
      console.error('Failed to load customer:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const handleAddContact = async (values: any) => {
    if (!id) return;
    try {
      await customerApi.addContact(parseInt(id), values);
      message.success(t('customers.contact_added'));
      contactForm.resetFields();
      setContactModalVisible(false);
      loadCustomer();
    } catch (error) {
      message.error(t('customers.contact_add_failed'));
    }
  };

  const handleAddFollowUp = async (values: any) => {
    if (!id) return;
    try {
      await customerApi.addFollowUp(parseInt(id), values);
      message.success(t('customers.follow_up_added'));
      followUpForm.resetFields();
      setFollowUpModalVisible(false);
      loadCustomer();
    } catch (error) {
      message.error(t('customers.follow_up_add_failed'));
    }
  };

  if (!customer) return null;

  const contactColumns = [
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    { title: t('customers.position'), dataIndex: 'position', key: 'position' },
    { title: t('common.phone'), dataIndex: 'phone', key: 'phone' },
    { title: t('common.email'), dataIndex: 'email', key: 'email' },
    {
      title: t('customers.primary'),
      dataIndex: 'is_primary',
      key: 'is_primary',
      render: (val: boolean) => (val ? <Tag color="green">{t('common.yes')}</Tag> : <Tag>{t('common.no')}</Tag>),
    },
  ];

  const followUpColumns = [
    { title: t('common.type'), dataIndex: 'type', key: 'type' },
    { title: t('common.content'), dataIndex: 'content', key: 'content' },
    { title: t('customers.next_follow'), dataIndex: 'next_follow_date', key: 'next_follow_date' },
  ];

  return (
    <div>
      <h2>{t('customers.detail_title')}</h2>
      <Card loading={loading}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label={t('customers.code')}>{customer.code}</Descriptions.Item>
          <Descriptions.Item label={t('customers.name')}>{customer.name}</Descriptions.Item>
          <Descriptions.Item label={t('customers.level')}>
            <Tag color={customer.level === 'vip' ? 'gold' : 'blue'}>{customer.level.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('customers.status')}>
            <Tag color={customer.status === 'active' ? 'green' : 'red'}>{customer.status.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('customers.country')}>{customer.country}</Descriptions.Item>
          <Descriptions.Item label={t('customers.source')}>{customer.source}</Descriptions.Item>
          <Descriptions.Item label={t('customers.email')}>{customer.email}</Descriptions.Item>
          <Descriptions.Item label={t('customers.phone')}>{customer.phone}</Descriptions.Item>
          <Descriptions.Item label={t('customers.address')} span={2}>{customer.address}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title={t('customers.contacts')}
        style={{ marginTop: 16 }}
        extra={
          <Button icon={<PlusOutlined />} onClick={() => setContactModalVisible(true)}>
            {t('customers.add_contact')}
          </Button>
        }
      >
        <Table columns={contactColumns} dataSource={customer.contacts} rowKey="id" pagination={false} />
      </Card>

      <Card
        title={t('customers.follow_ups')}
        style={{ marginTop: 16 }}
        extra={
          <Button icon={<PlusOutlined />} onClick={() => setFollowUpModalVisible(true)}>
            {t('customers.add_follow_up')}
          </Button>
        }
      >
        <Table columns={followUpColumns} dataSource={customer.follow_ups} rowKey="id" pagination={false} />
      </Card>

      <Modal title={t('customers.add_contact')} open={contactModalVisible} onCancel={() => setContactModalVisible(false)} onOk={() => contactForm.submit()}>
        <Form form={contactForm} onFinish={handleAddContact} layout="vertical">
          <Form.Item name="name" label={t('common.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="position" label={t('customers.position')}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label={t('common.phone')}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label={t('common.email')}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={t('customers.add_follow_up')} open={followUpModalVisible} onCancel={() => setFollowUpModalVisible(false)} onOk={() => followUpForm.submit()}>
        <Form form={followUpForm} onFinish={handleAddFollowUp} layout="vertical">
          <Form.Item name="type" label={t('common.type')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label={t('common.content')} rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerDetail;
