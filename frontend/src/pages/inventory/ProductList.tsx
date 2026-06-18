import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Modal, Form, InputNumber, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { inventoryApi, FinishedProduct } from '../../api/inventory';

const ProductList = () => {
  const [products, setProducts] = useState<FinishedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.listProducts({ limit: 100 });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAdd = async (values: any) => {
    try {
      await inventoryApi.createProduct(values);
      message.success('Product added');
      form.resetFields();
      setModalVisible(false);
      loadProducts();
    } catch (error) {
      message.error('Failed to add product');
    }
  };

  const columns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Product Name', dataIndex: 'product_name', key: 'product_name' },
    {
      title: 'Current Stock',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (stock: number, record: FinishedProduct) => (
        <Tag color={stock < record.safety_stock ? 'red' : 'green'}>{stock}</Tag>
      ),
    },
    { title: 'Safety Stock', dataIndex: 'safety_stock', key: 'safety_stock' },
  ];

  const filtered = products.filter(
    (p) =>
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Products</h2>
        <Space>
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            Add Product
          </Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={filtered} loading={loading} rowKey="id" />

      <Modal
        title="Add Product"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="product_name" label="Product Name" rules={[{ required: true }]}>
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

export default ProductList;
