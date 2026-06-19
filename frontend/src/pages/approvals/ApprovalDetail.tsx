import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Steps, Table, Button, Tag, Space, Modal, Input, message, Descriptions } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { approvalApi, ApprovalInstance, ApprovalNode, ApprovalRecord } from '../../api/approvals';

const statusColors: Record<string, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  cancelled: 'default',
};

const ApprovalDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [instance, setInstance] = useState<(ApprovalInstance & { nodes: ApprovalNode[]; records: ApprovalRecord[] }) | null>(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');

  const businessTypeLabels: Record<string, string> = {
    order: t('approvals.business_type_order'),
    production: t('approvals.business_type_production'),
    purchase: t('approvals.business_type_purchase'),
  };

  const loadDetail = async () => {
    if (!id) return;
    try {
      const res = await approvalApi.getDetail(parseInt(id));
      setInstance(res.data);
    } catch (error) {
      message.error(t('approvals.load_detail_failed'));
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleAction = async () => {
    if (!id) return;
    try {
      if (currentAction === 'approve') {
        await approvalApi.approve(parseInt(id), comment);
        message.success(t('approvals.approved'));
      } else {
        await approvalApi.reject(parseInt(id), comment);
        message.success(t('approvals.rejected'));
      }
      setCommentModalOpen(false);
      setComment('');
      loadDetail();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    }
  };

  const openActionModal = (action: 'approve' | 'reject') => {
    setCurrentAction(action);
    setCommentModalOpen(true);
  };

  if (!instance) return null;

  const currentStep = instance.nodes.findIndex(n => n.node_order === instance.current_node_order);

  const recordColumns = [
    {
      title: t('approvals.node'),
      dataIndex: 'node_id',
      key: 'node_id',
      render: (nodeId: number) => {
        const node = instance.nodes.find(n => n.id === nodeId);
        return node?.node_name || nodeId;
      },
    },
    {
      title: t('approvals.approver'),
      dataIndex: 'approver_id',
      key: 'approver_id',
    },
    {
      title: t('approvals.action_label'),
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag color={action === 'approve' ? 'green' : 'red'}>
          {action === 'approve' ? t('approvals.approve') : t('approvals.reject')}
        </Tag>
      ),
    },
    {
      title: t('approvals.comment'),
      dataIndex: 'comment',
      key: 'comment',
    },
    {
      title: t('approvals.time'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val: string) => new Date(val).toLocaleString(),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{t('approvals.detail_title')}</h2>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions>
          <Descriptions.Item label={t('approvals.business_type')}>{businessTypeLabels[instance.business_type] || instance.business_type}</Descriptions.Item>
          <Descriptions.Item label={t('approvals.business_id')}>{instance.business_id}</Descriptions.Item>
          <Descriptions.Item label={t('approvals.status')}><Tag color={statusColors[instance.status]}>{instance.status}</Tag></Descriptions.Item>
          <Descriptions.Item label={t('approvals.current_node')}>{t('approvals.level_label', { level: instance.current_node_order })}</Descriptions.Item>
          <Descriptions.Item label={t('approvals.created_at')}>{new Date(instance.created_at).toLocaleString()}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={t('approvals.flow')} style={{ marginBottom: 16 }}>
        <Steps
          current={currentStep}
          status={instance.status === 'rejected' ? 'error' : instance.status === 'approved' ? 'finish' : 'process'}
          items={instance.nodes.map((node) => ({
            title: node.node_name,
            description: `${node.approver_type === 'role' ? t('approvals.approver_type_role') : t('approvals.approver_type_user')}: ${node.approver_value}`,
          }))}
        />
      </Card>

      {instance.status === 'pending' && (
        <Card style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" icon={<CheckOutlined />} onClick={() => openActionModal('approve')}>
              {t('approvals.approve_title')}
            </Button>
            <Button danger icon={<CloseOutlined />} onClick={() => openActionModal('reject')}>
              {t('approvals.reject_title')}
            </Button>
          </Space>
        </Card>
      )}

      <Card title={t('approvals.flow')}>
        <Table
          columns={recordColumns}
          dataSource={instance.records}
          rowKey="id"
          pagination={false}
        />
      </Card>

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

export default ApprovalDetail;
