import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, message } from 'antd';
import { PlusOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { orderApi, Order } from '../../api/orders';
import { reportApi } from '../../api/reports';

const statusColors: Record<string, string> = {
  pending: 'default',
  confirmed: 'blue',
  in_production: 'orange',
  completed: 'green',
  cancelled: 'red',
};

const OrderList = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await orderApi.list({ limit: 100 });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

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

  const STATUS_LABELS: Record<string, string> = {
    pending: t('orders.status_pending'),
    pending_approval: t('orders.status_pending_approval'),
    confirmed: t('orders.status_confirmed'),
    in_production: t('orders.status_in_production'),
    completed: t('orders.status_completed'),
    cancelled: t('orders.status_cancelled'),
  };

  const columns = [
    { title: t('orders.order_no'), dataIndex: 'order_no', key: 'order_no' },
    { title: t('orders.customer_id'), dataIndex: 'customer_id', key: 'customer_id' },
    {
      title: t('orders.total_amount'),
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (val?: string | number) => (val != null ? `$${Number(val).toFixed(2)}` : '-'),
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
    {
      title: t('orders.action'),
      key: 'action',
      render: (_: any, record: Order) => (
        <Button type="link" onClick={() => navigate(`/orders/${record.id}`)}>
          {t('orders.view')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>{t('orders.title')}</h2>
        <Space>
          <Button icon={<FileExcelOutlined />} onClick={() => handleExport('xlsx')}>{t('reports.excel')}</Button>
          <Button icon={<FilePdfOutlined />} onClick={() => handleExport('pdf')}>{t('reports.pdf')}</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/orders/create')}>
            {t('orders.create_order')}
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={orders} loading={loading} rowKey="id" />
    </div>
  );
};

export default OrderList;
