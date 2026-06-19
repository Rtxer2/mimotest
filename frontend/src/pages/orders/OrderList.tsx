import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, message, Modal, Form, Input, InputNumber, Popconfirm, Select, DatePicker } from 'antd';
import { PlusOutlined, FileExcelOutlined, FilePdfOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { orderApi, Order } from '../../api/orders';
import { customerApi } from '../../api/customers';
import { reportApi } from '../../api/reports';

const statusColors: Record<string, string> = {
  pending: 'default',
  pending_approval: 'orange',
  confirmed: 'blue',
  in_production: 'cyan',
  completed: 'green',
  cancelled: 'red',
};

const STATUS_OPTIONS = ['pending', 'pending_approval', 'confirmed', 'in_production', 'completed', 'cancelled'];

const OrderList = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [customerFilter, setCustomerFilter] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [customerMap, setCustomerMap] = useState<Record<number, string>>({});

  const STATUS_LABELS: Record<string, string> = {
    pending: t('orders.status_pending'),
    pending_approval: t('orders.status_pending_approval'),
    confirmed: t('orders.status_confirmed'),
    in_production: t('orders.status_in_production'),
    completed: t('orders.status_completed'),
    cancelled: t('orders.status_cancelled'),
  };

  const loadOrders = async (status?: string | null) => {
    setLoading(true);
    try {
      const response = await orderApi.list({ limit: 100, status: status || undefined });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await customerApi.list({ limit: 100 });
      setCustomerList(res.data);
      const map: Record<number, string> = {};
      res.data.forEach((c: any) => { map[c.id] = c.name; });
      setCustomerMap(map);
    } catch {}
  };

  useEffect(() => {
    loadOrders();
    loadCustomers();
  }, []);

  const handleStatusFilter = (value: string | null) => {
    setStatusFilter(value);
    loadOrders(value);
  };

  const filteredOrders = orders.filter((order) => {
    if (searchText && !order.order_no.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (customerFilter && order.customer_id !== customerFilter) return false;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const created = dayjs(order.created_at);
      if (created.isBefore(dateRange[0], 'day') || created.isAfter(dateRange[1], 'day')) return false;
    }
    return true;
  });

  const handleExport = async (format: string) => {
    try {
      const res = await reportApi.export('orders', format);
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_report.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      message.error(t('reports.export_failed'));
    }
  };

  const openEdit = (record: Order) => {
    setEditingOrder(record);
    form.setFieldsValue({
      customer_id: record.customer_id,
      delivery_date: record.delivery_date,
      remarks: record.remarks,
    });
    setModalOpen(true);
  };

  const handleEdit = async (values: any) => {
    if (!editingOrder) return;
    setSubmitting(true);
    try {
      await orderApi.update(editingOrder.id, values);
      message.success(t('common.save'));
      setModalOpen(false);
      setEditingOrder(null);
      form.resetFields();
      loadOrders();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingOrder) return;
    try {
      await orderApi.delete(editingOrder.id);
      message.success(t('common.delete'));
      setModalOpen(false);
      setEditingOrder(null);
      loadOrders();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    }
  };

  const columns = [
    { title: t('orders.order_no'), dataIndex: 'order_no', key: 'order_no' },
    { title: t('customers.name'), dataIndex: 'customer_id', key: 'customer_id', render: (id: number) => customerMap[id] || id },
    {
      title: t('orders.total_amount'),
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (val?: string | number) => (val != null ? `¥${Number(val).toFixed(2)}` : '-'),
    },
    { title: t('orders.delivery_date'), dataIndex: 'delivery_date', key: 'delivery_date' },
    {
      title: t('orders.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] ?? 'default'}>{STATUS_LABELS[status] ?? status}</Tag>
      ),
    },
    { title: t('common.created_at'), dataIndex: 'created_at', key: 'created_at', render: (val: string) => val?.slice(0, 10) },
    {
      title: t('orders.action'),
      key: 'action',
      render: (_: any, record: Order) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/orders/${record.id}`)}>
            {t('orders.view')}
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            {t('common.edit')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>{t('orders.title')}</h2>
        <Space>
          <Input
            placeholder={t('common.search')}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 180 }}
            allowClear
          />
          <Select
            placeholder={t('orders.status')}
            value={statusFilter}
            onChange={handleStatusFilter}
            style={{ width: 140 }}
            allowClear
            options={STATUS_OPTIONS.map((s) => ({ value: s, label: STATUS_LABELS[s] ?? s }))}
          />
          <Select
            placeholder={t('customers.name')}
            value={customerFilter}
            onChange={(v) => setCustomerFilter(v)}
            style={{ width: 160 }}
            allowClear
            showSearch
            optionFilterProp="label"
            options={customerList.map((c) => ({ value: c.id, label: c.name }))}
          />
          <DatePicker.RangePicker
            value={dateRange as any}
            onChange={(dates) => setDateRange(dates as any)}
            style={{ width: 240 }}
          />
          <Button icon={<FileExcelOutlined />} onClick={() => handleExport('xlsx')}>{t('reports.excel')}</Button>
          <Button icon={<FilePdfOutlined />} onClick={() => handleExport('pdf')}>{t('reports.pdf')}</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/orders/create')}>
            {t('orders.create_order')}
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={filteredOrders} loading={loading} rowKey="id" />

      <Modal
        title={t('common.edit')}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingOrder(null); }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        footer={[
          <Popconfirm key="delete" title={t('common.confirm')} onConfirm={handleDelete}>
            <Button danger icon={<DeleteOutlined />}>{t('common.delete')}</Button>
          </Popconfirm>,
          <Button key="cancel" onClick={() => { setModalOpen(false); setEditingOrder(null); }}>{t('common.cancel')}</Button>,
          <Button key="ok" type="primary" loading={submitting} onClick={() => form.submit()}>{t('common.save')}</Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleEdit}>
          <Form.Item name="customer_id" label={t('orders.customer_id')} rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="delivery_date" label={t('orders.delivery_date')}>
            <Input />
          </Form.Item>
          <Form.Item name="remarks" label={t('orders.remarks')}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderList;
