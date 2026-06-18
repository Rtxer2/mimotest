import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Steps, Table, Button, Tag, Space, Modal, Input, message, Descriptions } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { approvalApi, ApprovalInstance, ApprovalNode, ApprovalRecord } from '../../api/approvals';

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

const ApprovalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [instance, setInstance] = useState<(ApprovalInstance & { nodes: ApprovalNode[]; records: ApprovalRecord[] }) | null>(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');

  const loadDetail = async () => {
    if (!id) return;
    try {
      const res = await approvalApi.getDetail(parseInt(id));
      setInstance(res.data);
    } catch (error) {
      message.error('Failed to load approval details');
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
        message.success('Approved');
      } else {
        await approvalApi.reject(parseInt(id), comment);
        message.success('Rejected');
      }
      setCommentModalOpen(false);
      setComment('');
      loadDetail();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || 'Operation failed');
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
      title: '节点',
      dataIndex: 'node_id',
      key: 'node_id',
      render: (nodeId: number) => {
        const node = instance.nodes.find(n => n.id === nodeId);
        return node?.node_name || nodeId;
      },
    },
    {
      title: '审批人',
      dataIndex: 'approver_id',
      key: 'approver_id',
    },
    {
      title: '动作',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag color={action === 'approve' ? 'green' : 'red'}>
          {action === 'approve' ? '通过' : '驳回'}
        </Tag>
      ),
    },
    {
      title: '意见',
      dataIndex: 'comment',
      key: 'comment',
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (t: string) => new Date(t).toLocaleString(),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>审批详情</h2>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions>
          <Descriptions.Item label="业务类型">{businessTypeLabels[instance.business_type] || instance.business_type}</Descriptions.Item>
          <Descriptions.Item label="单据ID">{instance.business_id}</Descriptions.Item>
          <Descriptions.Item label="状态"><Tag color={statusColors[instance.status]}>{instance.status}</Tag></Descriptions.Item>
          <Descriptions.Item label="当前节点">第 {instance.current_node_order} 级</Descriptions.Item>
          <Descriptions.Item label="发起时间">{new Date(instance.created_at).toLocaleString()}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="审批流程" style={{ marginBottom: 16 }}>
        <Steps
          current={currentStep}
          status={instance.status === 'rejected' ? 'error' : instance.status === 'approved' ? 'finish' : 'process'}
          items={instance.nodes.map((node) => ({
            title: node.node_name,
            description: `${node.approver_type === 'role' ? '角色' : '用户'}: ${node.approver_value}`,
          }))}
        />
      </Card>

      {instance.status === 'pending' && (
        <Card style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" icon={<CheckOutlined />} onClick={() => openActionModal('approve')}>
              审批通过
            </Button>
            <Button danger icon={<CloseOutlined />} onClick={() => openActionModal('reject')}>
              审批驳回
            </Button>
          </Space>
        </Card>
      )}

      <Card title="审批记录">
        <Table
          columns={recordColumns}
          dataSource={instance.records}
          rowKey="id"
          pagination={false}
        />
      </Card>

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

export default ApprovalDetail;
