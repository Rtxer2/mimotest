import { useEffect, useState } from 'react';
import { Table, Button, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { productionApi, ProductionOrder } from '../../api/production';

const statusColors: Record<string, string> = {
  pending: 'default',
  in_progress: 'processing',
  completed: 'success',
  delayed: 'error',
};

const ProductionOrderList = () => {
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
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Order ID', dataIndex: 'order_id', key: 'order_id' },
    { title: 'Workshop', dataIndex: 'assigned_workshop', key: 'assigned_workshop', render: (val?: string) => val ?? '-' },
    { title: 'Planned Start', dataIndex: 'planned_start', key: 'planned_start', render: (val?: string) => val ?? '-' },
    { title: 'Planned End', dataIndex: 'planned_end', key: 'planned_end', render: (val?: string) => val ?? '-' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] ?? 'default'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: ProductionOrder) => (
        <Button type="link" onClick={() => navigate(`/production/orders/${record.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2>Production Orders</h2>
      <Table columns={columns} dataSource={orders} loading={loading} rowKey="id" />
    </div>
  );
};

export default ProductionOrderList;
