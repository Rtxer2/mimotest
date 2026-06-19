import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { productionApi, ProductionOrder, ProductionStage } from '../../api/production';

const statusColors: Record<string, string> = {
  pending: 'default',
  in_progress: 'processing',
  completed: 'success',
  delayed: 'error',
};

const ProductionOrderDetail = () => {
  const { t } = useTranslation();
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
    { title: t('common.id'), dataIndex: 'id', key: 'id' },
    { title: t('production.stage_name'), dataIndex: 'stage_name', key: 'stage_name' },
    {
      title: t('production.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] ?? 'default'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: t('production.progress'),
      dataIndex: 'progress',
      key: 'progress',
      render: (val: number) => `${val}%`,
    },
    { title: t('production.start_time'), dataIndex: 'start_time', key: 'start_time', render: (val?: string) => val ?? '-' },
    { title: t('production.end_time'), dataIndex: 'end_time', key: 'end_time', render: (val?: string) => val ?? '-' },
    { title: t('production.remarks'), dataIndex: 'remarks', key: 'remarks', render: (val?: string) => val ?? '-' },
  ];

  return (
    <div>
      <h2>{t('production.detail_title')}</h2>
      <Card loading={loading}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label={t('common.id')}>{order.id}</Descriptions.Item>
          <Descriptions.Item label={t('production.order_id')}>{order.order_id}</Descriptions.Item>
          <Descriptions.Item label={t('production.workshop')}>{order.assigned_workshop ?? '-'}</Descriptions.Item>
          <Descriptions.Item label={t('production.planned_start')}>{order.planned_start ?? '-'}</Descriptions.Item>
          <Descriptions.Item label={t('production.planned_end')}>{order.planned_end ?? '-'}</Descriptions.Item>
          <Descriptions.Item label={t('production.status')}>
            <Tag color={statusColors[order.status] ?? 'default'}>{order.status.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('production.created_at')}>{order.created_at}</Descriptions.Item>
          <Descriptions.Item label={t('production.remarks')}>{order.remarks ?? '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={t('production.stages')} style={{ marginTop: 16 }}>
        <Table columns={stageColumns} dataSource={order.stages} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
};

export default ProductionOrderDetail;
