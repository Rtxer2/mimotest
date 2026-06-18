import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Popconfirm, message } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
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

const InitiatedList = () => {
  const navigate = useNavigate();
  const [instances, setInstances] = useState<ApprovalInstance[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInitiated = async () => {
    setLoading(true);
    try {
      const res = await approvalApi.getInitiated({ limit: 50 });
      setInstances(res.data);
    } catch (error) {
      message.error('Failed to load initiated approvals');
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
      message.success('Approval cancelled');
      loadInitiated();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || 'Operation failed');
    }
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
      render: (order: number, record: ApprovalInstance) =>
        record.status === 'pending' ? `第 ${order} 级` : '-',
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
          {record.status === 'pending' && (
            <Popconfirm
              title="确定要撤销这个审批吗？"
              onConfirm={() => handleCancel(record.id)}
            >
              <Button danger size="small" icon={<CloseCircleOutlined />}>
                撤销
              </Button>
            </Popconfirm>
          )}
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
      <h2 style={{ marginBottom: 16 }}>我发起的</h2>
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
