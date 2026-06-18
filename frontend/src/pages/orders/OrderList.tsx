import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { orderApi, Order } from '../../api/orders';

const statusColors: Record<string, string> = {
  pending: 'default',
  confirmed: 'blue',
  in_production: 'orange',
  completed: 'green',
  cancelled: 'red',
};

const OrderList = () => {
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

  const columns = [
    { title: 'Order No', dataIndex: 'order_no', key: 'order_no' },
    { title: 'Customer ID', dataIndex: 'customer_id', key: 'customer_id' },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (val?: string | number) => (val != null ? `$${Number(val).toFixed(2)}` : '-'),
    },
    { title: 'Delivery Date', dataIndex: 'delivery_date', key: 'delivery_date' },
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
      render: (_: any, record: Order) => (
        <Button type="link" onClick={() => navigate(`/orders/${record.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Orders</h2>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/orders/create')}>
            Create Order
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={orders} loading={loading} rowKey="id" />
    </div>
  );
};

export default OrderList;
