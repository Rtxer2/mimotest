import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Input, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { approvalApi, ApprovalInstance } from '../../api/approvals';

const statusColors: Record<string, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  cancelled: 'default',
};

const PendingList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [instances, setInstances] = useState<ApprovalInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [currentInstanceId, setCurrentInstanceId] = useState<number | null>(null);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');

  const businessTypeLabels: Record<string, string> = {
    order: t('approvals.business_type_order'),
    production: t('approvals.business_type_production'),
    purchase: t('approvals.business_type_purchase'),
  };

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await approvalApi.getPending({ limit: 50 });
      setInstances(res.data);
    } catch (error) {
      message.error(t('approvals.load_pending_failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleAction = async () => {
    if (!currentInstanceId) return;
    try {
      if (currentAction === 'approve') {
        await approvalApi.approve(currentInstanceId, comment);
        message.success(t('approvals.approved'));
      } else {
        await approvalApi.reject(currentInstanceId, comment);
        message.success(t('approvals.rejected'));
      }
      setCommentModalOpen(false);
      setComment('');
      loadPending();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    }
  };

  const openActionModal = (instanceId: number, action: 'approve' | 'reject') => {
    setCurrentInstanceId(instanceId);
    setCurrentAction(action);
    setCommentModalOpen(true);
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
      render: (order: number) => t('approvals.level_label', { level: order }),
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
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => openActionModal(record.id, 'approve')}
          >
            {t('approvals.approve')}
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseOutlined />}
            onClick={() => openActionModal(record.id, 'reject')}
          >
            {t('approvals.reject')}
          </Button>
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
      <h2 style={{ marginBottom: 16 }}>{t('approvals.pending_title')}</h2>
      <Table
        columns={columns}
        dataSource={instances}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title={currentAction === 'approve' ? t('approvals.approve_title') : t('approvals.reject_title')}
        open={commentModalOpen}
        onCancel={() => { setCommentModalOpen(false); setComment(''); }}
        onOk={handleAction}
      >
        <Input.TextArea
          rows={4}
          placeholder={t('approvals.comment_placeholder')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default PendingList;
