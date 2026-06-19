import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, InputNumber, Switch, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { approvalApi, ApprovalFlow } from '../../api/approvals';

const conditionTypeOptions = [
  { value: 'amount', label: '金额阈值' },
  { value: 'quantity', label: '数量阈值' },
  { value: 'always', label: '始终审批' },
  { value: 'manual', label: '仅手动' },
];

const conditionTypeLabels: Record<string, string> = {
  amount: '金额阈值',
  quantity: '数量阈值',
  always: '始终审批',
  manual: '仅手动',
};

const FlowConfig = () => {
  const [flows, setFlows] = useState<ApprovalFlow[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<ApprovalFlow | null>(null);
  const [form] = Form.useForm();
  const conditionType = Form.useWatch('condition_type', form);

  const loadFlows = async () => {
    setLoading(true);
    try {
      const res = await approvalApi.listFlows({ limit: 100 });
      setFlows(res.data);
    } catch (error) {
      message.error('加载流程失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlows();
  }, []);

  const handleSave = async (values: any) => {
    const submitData = {
      ...values,
      trigger_condition: {
        condition_type: values.condition_type,
        threshold: values.threshold ?? 0,
      },
    };
    delete submitData.condition_type;
    delete submitData.threshold;

    try {
      if (editingFlow) {
        await approvalApi.updateFlow(editingFlow.id, submitData);
        message.success('流程已更新');
      } else {
        await approvalApi.createFlow(submitData);
        message.success('流程已创建');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingFlow(null);
      loadFlows();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await approvalApi.deleteFlow(id);
      message.success('流程已删除');
      loadFlows();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const openEdit = (flow: ApprovalFlow) => {
    setEditingFlow(flow);
    const cond = flow.trigger_condition || {};
    form.setFieldsValue({
      name: flow.name,
      business_type: flow.business_type,
      condition_type: cond.condition_type || 'manual',
      threshold: cond.threshold,
      is_active: flow.is_active,
    });
    setModalOpen(true);
  };

  const renderTriggerCondition = (condition: Record<string, any>) => {
    if (!condition || !condition.condition_type) return '-';
    const label = conditionTypeLabels[condition.condition_type] ?? condition.condition_type;
    if (condition.threshold) {
      return `${label} (>= ${condition.threshold})`;
    }
    return label;
  };

  const columns = [
    { title: '流程名称', dataIndex: 'name', key: 'name' },
    { title: '业务类型', dataIndex: 'business_type', key: 'business_type' },
    {
      title: '触发条件',
      dataIndex: 'trigger_condition',
      key: 'trigger_condition',
      render: renderTriggerCondition,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApprovalFlow) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除这个流程吗？" onConfirm={() => handleDelete(record.id)}>
            <Button danger size="small" icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>审批流程配置</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingFlow(null); form.resetFields(); setModalOpen(true); }}
        >
          新建流程
        </Button>
      </div>
      <Table columns={columns} dataSource={flows} loading={loading} rowKey="id" />

      <Modal
        title={editingFlow ? '编辑流程' : '新建流程'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingFlow(null); }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="流程名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="business_type" label="业务类型" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'order', label: '订单' },
                { value: 'production', label: '生产工单' },
                { value: 'purchase', label: '采购单' },
              ]}
            />
          </Form.Item>
          <Form.Item name="condition_type" label="触发条件" rules={[{ required: true }]}>
            <Select options={conditionTypeOptions} />
          </Form.Item>
          {(conditionType === 'amount' || conditionType === 'quantity') && (
            <Form.Item name="threshold" label={conditionType === 'amount' ? '金额阈值' : '数量阈值'} rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          )}
          {editingFlow && (
            <Form.Item name="is_active" label="启用" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default FlowConfig;
