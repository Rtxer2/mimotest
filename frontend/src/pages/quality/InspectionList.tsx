import { useEffect, useState } from 'react';
import { Table, Button, Tag, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { qualityApi, QualityInspection } from '../../api/quality';

const InspectionList = () => {
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
      message.success('Inspection created');
      form.resetFields();
      setModalVisible(false);
      loadInspections();
    } catch (error) {
      message.error('Failed to create inspection');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Type', dataIndex: 'inspection_type', key: 'inspection_type' },
    { title: 'Item ID', dataIndex: 'item_id', key: 'item_id' },
    {
      title: 'Result',
      dataIndex: 'result',
      key: 'result',
      render: (result: string) => (
        <Tag color={result === 'pass' ? 'green' : 'red'}>{result}</Tag>
      ),
    },
    { title: 'Inspector', dataIndex: 'inspector', key: 'inspector' },
    { title: 'Inspect Time', dataIndex: 'inspect_time', key: 'inspect_time' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Inspections</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Add Inspection
        </Button>
      </div>
      <Table columns={columns} dataSource={inspections} loading={loading} rowKey="id" />

      <Modal
        title="Add Inspection"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item name="inspection_type" label="Inspection Type" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'incoming', label: 'Incoming' },
                { value: 'in_process', label: 'In Process' },
                { value: 'final', label: 'Final' },
              ]}
            />
          </Form.Item>
          <Form.Item name="item_id" label="Item ID" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="result" label="Result" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'pass', label: 'Pass' },
                { value: 'fail', label: 'Fail' },
              ]}
            />
          </Form.Item>
          <Form.Item name="inspector" label="Inspector">
            <Input />
          </Form.Item>
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InspectionList;
