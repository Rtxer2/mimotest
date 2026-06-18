import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Select, message } from 'antd';
import { orderApi, Order, OrderItem } from '../../api/orders';

const statusOptions = ['pending', 'confirmed', 'in_production', 'completed', 'cancelled'];

const statusColors: Record<string, string> = {
  pending: 'default',
  confirmed: 'blue',
  in_production: 'orange',
  completed: 'green',
  cancelled: 'red',
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<(Order & { items: OrderItem[] }) | null>(null);
  const [loading, setLoading] = useState(false);

  const loadOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await orderApi.get(parseInt(id));
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await orderApi.updateStatus(parseInt(id), status);
      message.success('Status updated');
      loadOrder();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  if (!order) return null;

  const itemColumns = [
    { title: 'Product Name', dataIndex: 'product_name', key: 'product_name' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (val?: string | number) => (val != null ? `$${Number(val).toFixed(2)}` : '-'),
    },
    { title: 'Specs', dataIndex: 'specs', key: 'specs' },
  ];

  return (
    <div>
      <h2>Order Detail</h2>
      <Card loading={loading}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Order No">{order.order_no}</Descriptions.Item>
          <Descriptions.Item label="Customer ID">{order.customer_id}</Descriptions.Item>
          <Descriptions.Item label="Total Amount">
            {order.total_amount != null ? `$${Number(order.total_amount).toFixed(2)}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Delivery Date">{order.delivery_date ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusColors[order.status] ?? 'default'}>{order.status.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created At">{order.created_at}</Descriptions.Item>
          <Descriptions.Item label="Remarks" span={2}>{order.remarks ?? '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Change Status" style={{ marginTop: 16 }}>
        <Select
          value={order.status}
          onChange={handleStatusChange}
          style={{ width: 200 }}
          options={statusOptions.map((s) => ({ label: s.replace('_', ' ').toUpperCase(), value: s }))}
        />
      </Card>

      <Card title="Order Items" style={{ marginTop: 16 }}>
        <Table columns={itemColumns} dataSource={order.items} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
};

export default OrderDetail;
