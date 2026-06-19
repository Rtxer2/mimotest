import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Drawer, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, SendOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { procurementApi, PurchaseRequest, PurchaseRequestItem } from '../../api/procurement';

const statusColors: Record<string, string> = {
  draft: 'default',
  pending_approval: 'orange',
  approved: 'green',
  rejected: 'red',
  completed: 'blue',
};

const PurchaseRequestList = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailItems, setDetailItems] = useState<PurchaseRequestItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await procurementApi.listRequests({ limit: 100 });
      setData(res.data);
    } catch {
      message.error(t('common.failed_to_load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (values: any) => {
    setSubmitting(true);
    try {
      await procurementApi.createRequest({
        supplier_id: values.supplier_id,
        remarks: values.remarks,
        items: values.items || [],
      });
      message.success(t('common.save'));
      setModalOpen(false);
      form.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitApproval = async (id: number) => {
    try {
      await procurementApi.submitRequest(id);
      message.success(t('procurement.submit_approval'));
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    }
  };

  const showDetail = async (id: number) => {
    setDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await procurementApi.getRequest(id);
      setDetailItems(res.data.items || []);
    } catch {
      message.error(t('common.failed_to_load'));
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    { title: t('procurement.request_no'), dataIndex: 'request_no', key: 'request_no' },
    { title: t('procurement.supplier_name'), dataIndex: 'supplier_id', key: 'supplier_id' },
    {
      title: t('procurement.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status] ?? 'default'}>{status}</Tag>,
    },
    { title: t('procurement.amount'), dataIndex: 'total_amount', key: 'total_amount', render: (val: number) => val?.toFixed(2) },
    { title: t('common.created_at'), dataIndex: 'created_at', key: 'created_at', render: (val: string) => val?.slice(0, 19)?.replace('T', ' ') },
    {
      title: t('common.actions'),
      key: 'action',
      render: (_: any, record: PurchaseRequest) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => showDetail(record.id)}>{t('common.view')}</Button>
          {record.status === 'draft' && (
            <Popconfirm title={t('common.confirm')} onConfirm={() => handleSubmitApproval(record.id)}>
              <Button size="small" icon={<SendOutlined />}>{t('procurement.submit_approval')}</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const itemColumns = [
    { title: t('procurement.material'), dataIndex: 'material_id', key: 'material_id' },
    { title: t('procurement.quantity'), dataIndex: 'quantity', key: 'quantity' },
    { title: t('procurement.unit_price'), dataIndex: 'unit_price', key: 'unit_price', render: (val: number) => val?.toFixed(2) },
    {
      title: t('procurement.amount'),
      key: 'amount',
      render: (_: any, record: PurchaseRequestItem) => ((record.quantity * record.unit_price) || 0).toFixed(2),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>{t('procurement.requests')}</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
          {t('procurement.create_request')}
        </Button>
      </div>
      <Table columns={columns} dataSource={data} loading={loading} rowKey="id" />

      <Modal
        title={t('procurement.create_request')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="supplier_id" label={t('procurement.supplier_name')} rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remarks" label={t('common.remarks')}>
            <Input />
          </Form.Item>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>{t('procurement.items')}</div>
                {fields.map((field) => (
                  <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item {...field} name={[field.name, 'material_id']} rules={[{ required: true }]}>
                      <InputNumber placeholder={t('procurement.material')} />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'quantity']} rules={[{ required: true }]}>
                      <InputNumber placeholder={t('procurement.quantity')} min={1} />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'unit_price']} rules={[{ required: true }]}>
                      <InputNumber placeholder={t('procurement.unit_price')} min={0} precision={2} />
                    </Form.Item>
                    <Button icon={<DeleteOutlined />} onClick={() => remove(field.name)} danger />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  {t('procurement.add_item')}
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Drawer
        title={t('procurement.items')}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={600}
      >
        <Table columns={itemColumns} dataSource={detailItems} loading={detailLoading} rowKey="id" pagination={false} />
      </Drawer>
    </div>
  );
};

export default PurchaseRequestList;
