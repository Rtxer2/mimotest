import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Input, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { approvalApi, ApprovalInstance } from '../../api/approvals';

const statusColors: Record<string, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  cancelled: 'default',
};

const businessTypeLabels: Record<string, string> = {
  order: '订单',
  production: '生产工单',
  purchase: '采购单',
};

const PendingList = () => {
  const navigate = useNavigate();
  const [instances, setInstances] = useState<ApprovalInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [currentInstanceId, setCurrentInstanceId] = useState<number | null>(null);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await approvalApi.getPending({ limit: 50 });
      setInstances(res.data);
    } catch (error) {
      message.error('Failed to load pending approvals');
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
        message.success('Approved');
      } else {
        await approvalApi.reject(currentInstanceId, comment);
        message.success('Rejected');
      }
      setCommentModalOpen(false);
      setComment('');
      loadPending();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || 'Operation failed');
    }
  };

  const openActionModal = (instanceId: number, action: 'approve' | 'reject') => {
    setCurrentInstanceId(instanceId);
    setCurrentAction(action);
    setCommentModalOpen(true);
  };

  const columns = [
    {
      title: '业务类型',
      dataIndex: 'business_type',
      key: 'business_type',
      render: (type: string) => businessTypeLabels[type] || type,
    },
    {
      title: '单据ID',
      dataIndex: 'business_id',
      key: 'business_id',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: '当前节点',
      dataIndex: 'current_node_order',
      key: 'current_node_order',
      render: (order: number) => `第 ${order} 级`,
    },
    {
      title: '发起时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (t: string) => new Date(t).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApprovalInstance) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => openActionModal(record.id, 'approve')}
          >
            通过
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseOutlined />}
            onClick={() => openActionModal(record.id, 'reject')}
          >
            驳回
          </Button>
          <Button
            size="small"
            onClick={() => navigate(`/approvals/${record.id}`)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>待我审批</h2>
      <Table
        columns={columns}
        dataSource={instances}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title={currentAction === 'approve' ? '审批通过' : '审批驳回'}
        open={commentModalOpen}
        onCancel={() => { setCommentModalOpen(false); setComment(''); }}
        onOk={handleAction}
      >
        <Input.TextArea
          rows={4}
          placeholder="请输入审批意见（可选）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default PendingList;
