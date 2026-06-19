import { useEffect, useState } from 'react';
import { Table, Button, Tag, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { qualityApi, QualityInspection } from '../../api/quality';

const InspectionList = () => {
  const { t } = useTranslation();
  const [inspections, setInspections] = useState<QualityInspection[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadInspections = async () => {
    setLoading(true);
    try {
      const response = await qualityApi.listInspections({ limit: 100 });
      setInspections(response.data);
    } catch (error) {
      console.error('Failed to load inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInspections();
  }, []);

  const handleAdd = async (values: any) => {
    try {
      await qualityApi.createInspection(values);
      message.success(t('quality.inspection_created'));
      form.resetFields();
      setModalVisible(false);
      loadInspections();
    } catch (error) {
      message.error(t('quality.inspection_create_failed'));
    }
  };

  const columns = [
    { title: t('quality.id'), dataIndex: 'id', key: 'id' },
    { title: t('quality.inspection_type'), dataIndex: 'inspection_type', key: 'inspection_type' },
    { title: t('quality.item_id'), dataIndex: 'item_id', key: 'item_id' },
    {
      title: t('quality.result'),
      dataIndex: 'result',
      key: 'result',
      render: (result: string) => (
        <Tag color={result === 'pass' ? 'green' : 'red'}>{result === 'pass' ? t('quality.result_pass') : t('quality.result_fail')}</Tag>
      ),
    },
    { title: t('quality.inspector'), dataIndex: 'inspector', key: 'inspector' },
    { title: t('quality.inspect_time'), dataIndex: 'inspect_time', key: 'inspect_time' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>{t('quality.inspections_title')}</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          {t('quality.add_inspection')}
        </Button>
      </div>
      <Table columns={columns} dataSource={inspections} loading={loading} rowKey="id" />

      <Modal
        title={t('quality.add_inspection')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item name="inspection_type" label={t('quality.inspection_type')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'incoming', label: t('quality.type_incoming') },
                { value: 'in_process', label: t('quality.type_in_process') },
                { value: 'final', label: t('quality.type_final') },
              ]}
            />
          </Form.Item>
          <Form.Item name="item_id" label={t('quality.item_id')} rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="result" label={t('quality.result')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'pass', label: t('quality.result_pass') },
                { value: 'fail', label: t('quality.result_fail') },
              ]}
            />
          </Form.Item>
          <Form.Item name="inspector" label={t('quality.inspector')}>
            <Input />
          </Form.Item>
          <Form.Item name="remarks" label={t('quality.remarks')}>
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InspectionList;
