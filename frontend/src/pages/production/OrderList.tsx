import { useEffect, useState } from 'react';
import { Table, Button, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productionApi, ProductionOrder } from '../../api/production';

const statusColors: Record<string, string> = {
  pending: 'default',
  in_progress: 'processing',
  completed: 'success',
  delayed: 'error',
};

const ProductionOrderList = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await productionApi.listOrders({ limit: 100 });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load production orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const columns = [
    { title: t('common.id'), dataIndex: 'id', key: 'id' },
    { title: t('production.order_id'), dataIndex: 'order_id', key: 'order_id' },
    { title: t('production.workshop'), dataIndex: 'assigned_workshop', key: 'assigned_workshop', render: (val?: string) => val ?? '-' },
    { title: t('production.planned_start'), dataIndex: 'planned_start', key: 'planned_start', render: (val?: string) => val ?? '-' },
    { title: t('production.planned_end'), dataIndex: 'planned_end', key: 'planned_end', render: (val?: string) => val ?? '-' },
    {
      title: t('production.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] ?? 'default'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: t('production.action'),
      key: 'action',
      render: (_: unknown, record: ProductionOrder) => (
        <Button type="link" onClick={() => navigate(`/production/orders/${record.id}`)}>
          {t('production.view')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2>{t('production.order_list_title')}</h2>
      <Table columns={columns} dataSource={orders} loading={loading} rowKey="id" />
    </div>
  );
};

export default ProductionOrderList;
