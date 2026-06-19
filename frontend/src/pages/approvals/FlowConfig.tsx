import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, InputNumber, Switch, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { approvalApi, ApprovalFlow } from '../../api/approvals';

const FlowConfig = () => {
  const { t } = useTranslation();
  const [flows, setFlows] = useState<ApprovalFlow[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<ApprovalFlow | null>(null);
  const [form] = Form.useForm();
  const conditionType = Form.useWatch('condition_type', form);

  const conditionTypeOptions = [
    { value: 'amount', label: t('approvals.condition_amount') },
    { value: 'quantity', label: t('approvals.condition_quantity') },
    { value: 'always', label: t('approvals.condition_always') },
    { value: 'manual', label: t('approvals.condition_manual') },
  ];

  const conditionTypeLabels: Record<string, string> = {
    amount: t('approvals.condition_amount'),
    quantity: t('approvals.condition_quantity'),
    always: t('approvals.condition_always'),
    manual: t('approvals.condition_manual'),
  };

  const loadFlows = async () => {
    setLoading(true);
    try {
      const res = await approvalApi.listFlows({ limit: 100 });
      setFlows(res.data);
    } catch (error) {
      message.error(t('approvals.load_flows_failed'));
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
        message.success(t('approvals.flow_updated'));
      } else {
        await approvalApi.createFlow(submitData);
        message.success(t('approvals.flow_created'));
      }
      setModalOpen(false);
      form.resetFields();
      setEditingFlow(null);
      loadFlows();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await approvalApi.deleteFlow(id);
      message.success(t('approvals.flow_deleted'));
      loadFlows();
    } catch (error) {
      message.error(t('approvals.delete_failed'));
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
    { title: t('approvals.flow_name'), dataIndex: 'name', key: 'name' },
    { title: t('approvals.business_type'), dataIndex: 'business_type', key: 'business_type' },
    {
      title: t('approvals.trigger_condition'),
      dataIndex: 'trigger_condition',
      key: 'trigger_condition',
      render: renderTriggerCondition,
    },
    {
      title: t('approvals.status'),
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? t('approvals.status_active') : t('approvals.status_inactive')}</Tag>,
    },
    {
      title: t('approvals.action'),
      key: 'action',
      render: (_: any, record: ApprovalFlow) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>{t('approvals.edit')}</Button>
          <Popconfirm title={t('approvals.delete_flow_confirm')} onConfirm={() => handleDelete(record.id)}>
            <Button danger size="small" icon={<DeleteOutlined />}>{t('approvals.delete')}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>{t('approvals.flow_config_title')}</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditingFlow(null); form.resetFields(); setModalOpen(true); }}
        >
          {t('approvals.create_flow')}
        </Button>
      </div>
      <Table columns={columns} dataSource={flows} loading={loading} rowKey="id" />

      <Modal
        title={editingFlow ? t('approvals.edit_flow') : t('approvals.create_flow')}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingFlow(null); }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label={t('approvals.flow_name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="business_type" label={t('approvals.business_type')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'order', label: t('approvals.business_type_order') },
                { value: 'production', label: t('approvals.business_type_production') },
                { value: 'purchase', label: t('approvals.business_type_purchase') },
              ]}
            />
          </Form.Item>
          <Form.Item name="condition_type" label={t('approvals.trigger_condition')} rules={[{ required: true }]}>
            <Select options={conditionTypeOptions} />
          </Form.Item>
          {(conditionType === 'amount' || conditionType === 'quantity') && (
            <Form.Item name="threshold" label={t('approvals.threshold_label')} rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          )}
          {editingFlow && (
            <Form.Item name="is_active" label={t('approvals.status_active')} valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default FlowConfig;
