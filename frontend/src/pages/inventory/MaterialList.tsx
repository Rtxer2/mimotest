import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Modal, Form, InputNumber, message, Drawer } from 'antd';
import { PlusOutlined, SearchOutlined, ArrowUpOutlined, ArrowDownOutlined, HistoryOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { inventoryApi, Material, StockTransaction } from '../../api/inventory';

const MaterialList = () => {
  const { t } = useTranslation();
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
      message.success(t('inventory.material_added'));
      addForm.resetFields();
      setAddModalOpen(false);
      loadMaterials();
    } catch (error) {
      message.error(t('inventory.material_add_failed'));
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
      message.success(t('inventory.stock_success', { type: stockType === 'in' ? t('inventory.stock_in') : t('inventory.stock_out') }));
      setStockModalOpen(false);
      loadMaterials();
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      message.error(typeof detail === 'string' ? detail : t('inventory.stock_failed'));
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
      message.error(t('inventory.load_transactions_failed'));
    } finally {
      setTxLoading(false);
    }
  };

  const columns = [
    { title: t('inventory.code'), dataIndex: 'code', key: 'code' },
    { title: t('inventory.name'), dataIndex: 'name', key: 'name' },
    { title: t('inventory.unit'), dataIndex: 'unit', key: 'unit' },
    {
      title: t('inventory.current_stock'),
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (stock: number, record: Material) => (
        <Tag color={stock < record.safety_stock ? 'red' : 'green'}>{stock}</Tag>
      ),
    },
    { title: t('inventory.safety_stock'), dataIndex: 'safety_stock', key: 'safety_stock' },
    {
      title: t('inventory.action'),
      key: 'action',
      render: (_: any, record: Material) => (
        <Space>
          <Button size="small" type="primary" icon={<ArrowDownOutlined />} onClick={() => openStockModal(record, 'in')}>
            {t('inventory.stock_in')}
          </Button>
          <Button size="small" danger icon={<ArrowUpOutlined />} onClick={() => openStockModal(record, 'out')}>
            {t('inventory.stock_out')}
          </Button>
          <Button size="small" icon={<HistoryOutlined />} onClick={() => showTransactions(record)}>
            {t('inventory.stock_records')}
          </Button>
        </Space>
      ),
    },
  ];

  const txColumns = [
    {
      title: t('common.type'),
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      render: (val: string) => (
        <Tag color={val === 'in' ? 'green' : 'red'}>{val === 'in' ? t('inventory.stock_in') : t('inventory.stock_out')}</Tag>
      ),
    },
    { title: t('inventory.quantity'), dataIndex: 'quantity', key: 'quantity' },
    { title: t('common.reason'), dataIndex: 'reason', key: 'reason', render: (r: string) => r || '-' },
    { title: t('common.date'), dataIndex: 'transaction_date', key: 'transaction_date' },
  ];

  const filtered = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>{t('inventory.materials_title')}</h2>
        <Space>
          <Input
            placeholder={t('inventory.search_materials')}
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
            {t('inventory.add_material')}
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={filtered} loading={loading} rowKey="id" />

      <Modal
        title={t('inventory.add_material')}
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        onOk={() => addForm.submit()}
      >
        <Form form={addForm} onFinish={handleAdd} layout="vertical">
          <Form.Item name="code" label={t('inventory.code')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label={t('inventory.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="unit" label={t('inventory.unit')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="safety_stock" label={t('inventory.safety_stock')} rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${stockType === 'in' ? t('inventory.stock_in') : t('inventory.stock_out')} - ${selectedMaterial?.name}`}
        open={stockModalOpen}
        onCancel={() => setStockModalOpen(false)}
        onOk={() => stockForm.submit()}
        confirmLoading={submitting}
      >
        <Form form={stockForm} layout="vertical" onFinish={handleStockSubmit}>
          <Form.Item name="quantity" label={t('inventory.quantity')} rules={[{ required: true, message: t('inventory.quantity_required') }]}>
            <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label={t('common.remark')}>
            <Input.TextArea rows={2} placeholder={t('inventory.stock_reason_placeholder')} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`${selectedMaterial?.name} - ${t('inventory.stock_record_title')}`}
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
