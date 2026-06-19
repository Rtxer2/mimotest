import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Popconfirm, message } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { approvalApi, ApprovalInstance } from '../../api/approvals';

const statusColors: Record<string, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  cancelled: 'default',
};

const InitiatedList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [instances, setInstances] = useState<ApprovalInstance[]>([]);
  const [loading, setLoading] = useState(false);

  const businessTypeLabels: Record<string, string> = {
    order: t('approvals.business_type_order'),
    production: t('approvals.business_type_production'),
    purchase: t('approvals.business_type_purchase'),
  };

  const loadInitiated = async () => {
    setLoading(true);
    try {
      const res = await approvalApi.getInitiated({ limit: 50 });
      setInstances(res.data);
    } catch (error) {
      message.error(t('approvals.load_initiated_failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitiated();
  }, []);

  const handleCancel = async (instanceId: number) => {
    try {
      await approvalApi.cancel(instanceId);
      message.success(t('approvals.cancelled'));
      loadInitiated();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    }
  };

  const columns = [
    {
      title: t('approvals.business_type'),
      dataIndex: 'business_type',
      key: 'business_type',
      render: (type: string) => businessTypeLabels[type] || type,
    },
    {
      title: t('approvals.business_id'),
      dataIndex: 'business_id',
      key: 'business_id',
    },
    {
      title: t('approvals.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: t('approvals.current_node'),
      dataIndex: 'current_node_order',
      key: 'current_node_order',
      render: (order: number, record: ApprovalInstance) =>
        record.status === 'pending' ? t('approvals.level_label', { level: order }) : '-',
    },
    {
      title: t('approvals.created_at'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: t('approvals.action'),
      key: 'action',
      render: (_: any, record: ApprovalInstance) => (
        <Space>
          {record.status === 'pending' && (
            <Popconfirm
              title={t('approvals.cancel_confirm')}
              onConfirm={() => handleCancel(record.id)}
            >
              <Button danger size="small" icon={<CloseCircleOutlined />}>
                {t('approvals.cancel')}
              </Button>
            </Popconfirm>
          )}
          <Button
            size="small"
            onClick={() => navigate(`/approvals/${record.id}`)}
          >
            {t('approvals.detail')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{t('approvals.initiated_title')}</h2>
      <Table
        columns={columns}
        dataSource={instances}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
};

export default InitiatedList;
