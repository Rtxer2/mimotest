import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Tag } from 'antd';
import { productionApi, ProductionOrder, ProductionStage } from '../../api/production';

const statusColors: Record<string, string> = {
  pending: 'default',
  in_progress: 'processing',
  completed: 'success',
  delayed: 'error',
};

const ProductionOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<(ProductionOrder & { stages: ProductionStage[] }) | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadOrder = async () => {
      setLoading(true);
      try {
        const response = await productionApi.getOrder(parseInt(id));
        setOrder(response.data);
      } catch (error) {
        console.error('Failed to load production order:', error);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  if (!order) return null;

  const stageColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Stage Name', dataIndex: 'stage_name', key: 'stage_name' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] ?? 'default'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (val: number) => `${val}%`,
    },
    { title: 'Start Time', dataIndex: 'start_time', key: 'start_time', render: (val?: string) => val ?? '-' },
    { title: 'End Time', dataIndex: 'end_time', key: 'end_time', render: (val?: string) => val ?? '-' },
    { title: 'Remarks', dataIndex: 'remarks', key: 'remarks', render: (val?: string) => val ?? '-' },
  ];

  return (
    <div>
      <h2>Production Order Detail</h2>
      <Card loading={loading}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="ID">{order.id}</Descriptions.Item>
          <Descriptions.Item label="Order ID">{order.order_id}</Descriptions.Item>
          <Descriptions.Item label="Workshop">{order.assigned_workshop ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Planned Start">{order.planned_start ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Planned End">{order.planned_end ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusColors[order.status] ?? 'default'}>{order.status.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created At">{order.created_at}</Descriptions.Item>
          <Descriptions.Item label="Remarks">{order.remarks ?? '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Production Stages" style={{ marginTop: 16 }}>
        <Table columns={stageColumns} dataSource={order.stages} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
};

export default ProductionOrderDetail;
