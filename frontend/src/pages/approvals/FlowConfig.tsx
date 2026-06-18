import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, Switch, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { approvalApi, ApprovalFlow } from '../../api/approvals';

const FlowConfig = () => {
  const [flows, setFlows] = useState<ApprovalFlow[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<ApprovalFlow | null>(null);
  const [form] = Form.useForm();

  const loadFlows = async () => {
    setLoading(true);
    try {
      const res = await approvalApi.listFlows({ limit: 100 });
      setFlows(res.data);
    } catch (error) {
      message.error('Failed to load flows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlows();
  }, []);

  const handleSave = async (values: any) => {
    try {
      if (editingFlow) {
        await approvalApi.updateFlow(editingFlow.id, values);
        message.success('Flow updated');
      } else {
        await approvalApi.createFlow(values);
        message.success('Flow created');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingFlow(null);
      loadFlows();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await approvalApi.deleteFlow(id);
      message.success('Flow deleted');
      loadFlows();
    } catch (error) {
      message.error('Failed to delete flow');
    }
  };

  const openEdit = (flow: ApprovalFlow) => {
    setEditingFlow(flow);
    form.setFieldsValue({
      name: flow.name,
      business_type: flow.business_type,
      trigger_condition: JSON.stringify(flow.trigger_condition),
      is_active: flow.is_active,
    });
    setModalOpen(true);
  };

  const columns = [
    {
      title: '流程名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '业务类型',
      dataIndex: 'business_type',
      key: 'business_type',
    },
    {
      title: '触发条件',
      dataIndex: 'trigger_condition',
      key: 'trigger_condition',
      render: (condition: Record<string, any>) => JSON.stringify(condition),
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
          <Form.Item name="trigger_condition" label="触发条件（JSON）">
            <Input.TextArea rows={2} placeholder='{"min_amount": 10000}' />
          </Form.Item>
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
