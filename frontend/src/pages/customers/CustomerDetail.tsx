import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { customerApi, Customer, Contact, FollowUp } from '../../api/customers';

const CustomerDetail = () => {
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
      message.success('Contact added');
      contactForm.resetFields();
      setContactModalVisible(false);
      loadCustomer();
    } catch (error) {
      message.error('Failed to add contact');
    }
  };

  const handleAddFollowUp = async (values: any) => {
    if (!id) return;
    try {
      await customerApi.addFollowUp(parseInt(id), values);
      message.success('Follow-up added');
      followUpForm.resetFields();
      setFollowUpModalVisible(false);
      loadCustomer();
    } catch (error) {
      message.error('Failed to add follow-up');
    }
  };

  if (!customer) return null;

  const contactColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Position', dataIndex: 'position', key: 'position' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Primary',
      dataIndex: 'is_primary',
      key: 'is_primary',
      render: (val: boolean) => (val ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>),
    },
  ];

  const followUpColumns = [
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Content', dataIndex: 'content', key: 'content' },
    { title: 'Next Follow', dataIndex: 'next_follow_date', key: 'next_follow_date' },
  ];

  return (
    <div>
      <h2>Customer Detail</h2>
      <Card loading={loading}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Code">{customer.code}</Descriptions.Item>
          <Descriptions.Item label="Name">{customer.name}</Descriptions.Item>
          <Descriptions.Item label="Level">
            <Tag color={customer.level === 'vip' ? 'gold' : 'blue'}>{customer.level.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={customer.status === 'active' ? 'green' : 'red'}>{customer.status.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Country">{customer.country}</Descriptions.Item>
          <Descriptions.Item label="Source">{customer.source}</Descriptions.Item>
          <Descriptions.Item label="Email">{customer.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{customer.phone}</Descriptions.Item>
          <Descriptions.Item label="Address" span={2}>{customer.address}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="Contacts"
        style={{ marginTop: 16 }}
        extra={
          <Button icon={<PlusOutlined />} onClick={() => setContactModalVisible(true)}>
            Add Contact
          </Button>
        }
      >
        <Table columns={contactColumns} dataSource={customer.contacts} rowKey="id" pagination={false} />
      </Card>

      <Card
        title="Follow-ups"
        style={{ marginTop: 16 }}
        extra={
          <Button icon={<PlusOutlined />} onClick={() => setFollowUpModalVisible(true)}>
            Add Follow-up
          </Button>
        }
      >
        <Table columns={followUpColumns} dataSource={customer.follow_ups} rowKey="id" pagination={false} />
      </Card>

      <Modal title="Add Contact" open={contactModalVisible} onCancel={() => setContactModalVisible(false)} onOk={() => contactForm.submit()}>
        <Form form={contactForm} onFinish={handleAddContact} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="position" label="Position">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Add Follow-up" open={followUpModalVisible} onCancel={() => setFollowUpModalVisible(false)} onOk={() => followUpForm.submit()}>
        <Form form={followUpForm} onFinish={handleAddFollowUp} layout="vertical">
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="Content" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerDetail;
