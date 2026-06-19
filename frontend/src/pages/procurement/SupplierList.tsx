import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { procurementApi, Supplier } from '../../api/procurement';

const SupplierList = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await procurementApi.listSuppliers({ limit: 100 });
      setData(res.data);
    } catch {
      message.error(t('common.failed_to_load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (values: any) => {
    setSubmitting(true);
    try {
      if (editing) {
        await procurementApi.updateSupplier(editing.id, values);
      } else {
        await procurementApi.createSupplier(values);
      }
      message.success(t('common.save'));
      setModalOpen(false);
      form.resetFields();
      setEditing(null);
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await procurementApi.deleteSupplier(id);
      message.success(t('common.delete'));
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    }
  };

  const openEdit = (record: Supplier) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const filtered = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.contact_person?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: t('procurement.supplier_name'), dataIndex: 'name', key: 'name' },
    { title: t('procurement.contact_person'), dataIndex: 'contact_person', key: 'contact_person' },
    { title: t('procurement.phone'), dataIndex: 'phone', key: 'phone' },
    { title: t('procurement.email'), dataIndex: 'email', key: 'email' },
    {
      title: t('procurement.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? t('procurement.active') : t('procurement.inactive')}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'action',
      render: (_: any, record: Supplier) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>{t('common.edit')}</Button>
          <Popconfirm title={t('common.confirm')} onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>{t('common.delete')}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>{t('procurement.suppliers')}</h2>
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>
            {t('procurement.add_supplier')}
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={filtered} loading={loading} rowKey="id" />

      <Modal
        title={editing ? t('common.edit') : t('procurement.add_supplier')}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label={t('procurement.supplier_name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contact_person" label={t('procurement.contact_person')}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label={t('procurement.phone')}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label={t('procurement.email')}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label={t('procurement.address')}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label={t('procurement.status')} initialValue="active">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierList;
