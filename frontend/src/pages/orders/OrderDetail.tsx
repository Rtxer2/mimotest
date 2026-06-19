import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Select, Button, message, Popconfirm } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { orderApi, Order, OrderItem } from '../../api/orders';

const statusOptions = ['pending', 'confirmed', 'in_production', 'completed', 'cancelled'];

const statusColors: Record<string, string> = {
  pending: 'default',
  pending_approval: 'orange',
  confirmed: 'blue',
  in_production: 'cyan',
  completed: 'green',
  cancelled: 'red',
};

const statusLabels: Record<string, string> = {
  pending: '待处理',
  pending_approval: '待审批',
  confirmed: '已确认',
  in_production: '生产中',
  completed: '已完成',
  cancelled: '已取消',
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
      message.success('状态已更新');
      loadOrder();
    } catch (error) {
      message.error('更新状态失败');
    }
  };

  const handleSubmitApproval = async () => {
    if (!id) return;
    try {
      await orderApi.submitForApproval(parseInt(id));
      message.success('已提交审批');
      loadOrder();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || '提交审批失败');
    }
  };

  if (!order) return null;

  const itemColumns = [
    { title: '产品名称', dataIndex: 'product_name', key: 'product_name' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    {
      title: '单价',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (val?: string | number) => (val != null ? `¥${Number(val).toFixed(2)}` : '-'),
    },
    { title: '规格', dataIndex: 'specs', key: 'specs' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>订单详情</h2>
        {order.status === 'pending' && (
          <Popconfirm title="确定提交审批吗？" onConfirm={handleSubmitApproval}>
            <Button type="primary" icon={<SendOutlined />}>发起审批</Button>
          </Popconfirm>
        )}
      </div>
      <Card loading={loading}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="订单号">{order.order_no}</Descriptions.Item>
          <Descriptions.Item label="客户ID">{order.customer_id}</Descriptions.Item>
          <Descriptions.Item label="总金额">
            {order.total_amount != null ? `¥${Number(order.total_amount).toFixed(2)}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="交货日期">{order.delivery_date ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusColors[order.status] ?? 'default'}>
              {statusLabels[order.status] ?? order.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{order.created_at}</Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>{order.remarks ?? '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {order.status !== 'pending_approval' && (
        <Card title="变更状态" style={{ marginTop: 16 }}>
          <Select
            value={order.status}
            onChange={handleStatusChange}
            style={{ width: 200 }}
            options={statusOptions.map((s) => ({ label: statusLabels[s] ?? s, value: s }))}
          />
        </Card>
      )}

      <Card title="订单明细" style={{ marginTop: 16 }}>
        <Table columns={itemColumns} dataSource={order.items} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
};

export default OrderDetail;
