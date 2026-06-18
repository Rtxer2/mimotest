import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Modal, Form, InputNumber, message, Drawer } from 'antd';
import { PlusOutlined, SearchOutlined, ArrowUpOutlined, ArrowDownOutlined, HistoryOutlined } from '@ant-design/icons';
import { inventoryApi, Material, StockTransaction } from '../../api/inventory';

const MaterialList = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockType, setStockType] = useState<'in' | 'out'>('in');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [txDrawerOpen, setTxDrawerOpen] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addForm] = Form.useForm();
  const [stockForm] = Form.useForm();

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
      addForm.resetFields();
      setAddModalOpen(false);
      loadMaterials();
    } catch (error) {
      message.error('Failed to add material');
    }
  };

  const openStockModal = (material: Material, type: 'in' | 'out') => {
    setSelectedMaterial(material);
    setStockType(type);
    stockForm.resetFields();
    setStockModalOpen(true);
  };

  const handleStockSubmit = async (values: any) => {
    if (!selectedMaterial) return;
    setSubmitting(true);
    try {
      await inventoryApi.createTransaction({
        item_type: 'material',
        item_id: selectedMaterial.id,
        transaction_type: stockType,
        quantity: values.quantity,
        reason: values.reason,
      });
      message.success(`Stock ${stockType === 'in' ? '入库' : '出库'}成功`);
      setStockModalOpen(false);
      loadMaterials();
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      message.error(typeof detail === 'string' ? detail : '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const showTransactions = async (material: Material) => {
    setSelectedMaterial(material);
    setTxDrawerOpen(true);
    setTxLoading(true);
    try {
      const res = await inventoryApi.listTransactions({ item_type: 'material', item_id: material.id, limit: 50 });
      setTransactions(res.data);
    } catch (error) {
      message.error('Failed to load transactions');
    } finally {
      setTxLoading(false);
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
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Material) => (
        <Space>
          <Button size="small" type="primary" icon={<ArrowDownOutlined />} onClick={() => openStockModal(record, 'in')}>
            入库
          </Button>
          <Button size="small" danger icon={<ArrowUpOutlined />} onClick={() => openStockModal(record, 'out')}>
            出库
          </Button>
          <Button size="small" icon={<HistoryOutlined />} onClick={() => showTransactions(record)}>
            记录
          </Button>
        </Space>
      ),
    },
  ];

  const txColumns = [
    {
      title: 'Type',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      render: (t: string) => (
        <Tag color={t === 'in' ? 'green' : 'red'}>{t === 'in' ? '入库' : '出库'}</Tag>
      ),
    },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Reason', dataIndex: 'reason', key: 'reason', render: (r: string) => r || '-' },
    { title: 'Date', dataIndex: 'transaction_date', key: 'transaction_date' },
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
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
            Add Material
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={filtered} loading={loading} rowKey="id" />

      <Modal
        title="Add Material"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onOk={() => addForm.submit()}
      >
        <Form form={addForm} onFinish={handleAdd} layout="vertical">
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

      <Modal
        title={`${stockType === 'in' ? '入库' : '出库'} - ${selectedMaterial?.name}`}
        open={stockModalOpen}
        onCancel={() => setStockModalOpen(false)}
        onOk={() => stockForm.submit()}
        confirmLoading={submitting}
      >
        <Form form={stockForm} layout="vertical" onFinish={handleStockSubmit}>
          <Form.Item name="quantity" label="数量" rules={[{ required: true, message: '请输入数量' }]}>
            <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="备注">
            <Input.TextArea rows={2} placeholder="入库/出库原因" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`${selectedMaterial?.name} - 库存记录`}
        open={txDrawerOpen}
        onClose={() => setTxDrawerOpen(false)}
        width={600}
      >
        <Table
          columns={txColumns}
          dataSource={transactions}
          loading={txLoading}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Drawer>
    </div>
  );
};

export default MaterialList;
