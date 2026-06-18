import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Modal, Form, InputNumber, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { inventoryApi, Material } from '../../api/inventory';

const MaterialList = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.listMaterials({ limit: 100 });
      setMaterials(response.data);
    } catch (error) {
      console.error('Failed to load materials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleAdd = async (values: any) => {
    try {
      await inventoryApi.createMaterial(values);
      message.success('Material added');
      form.resetFields();
      setModalVisible(false);
      loadMaterials();
    } catch (error) {
      message.error('Failed to add material');
    }
  };

  const columns = [
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Unit', dataIndex: 'unit', key: 'unit' },
    {
      title: 'Current Stock',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (stock: number, record: Material) => (
        <Tag color={stock < record.safety_stock ? 'red' : 'green'}>{stock}</Tag>
      ),
    },
    { title: 'Safety Stock', dataIndex: 'safety_stock', key: 'safety_stock' },
  ];

  const filtered = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Materials</h2>
        <Space>
          <Input
            placeholder="Search materials..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            Add Material
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={filtered} loading={loading} rowKey="id" />

      <Modal
        title="Add Material"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="unit" label="Unit" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="safety_stock" label="Safety Stock" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MaterialList;
