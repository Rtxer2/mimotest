import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Modal, Form, InputNumber, Select, message, Drawer, Upload, Image, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, ArrowUpOutlined, ArrowDownOutlined, HistoryOutlined, UploadOutlined, DeleteOutlined, EditOutlined, TagsOutlined } from '@ant-design/icons';
import { inventoryApi, FinishedProduct, StockTransaction, Category } from '../../api/inventory';

const ProductList = () => {
  const [products, setProducts] = useState<FinishedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockType, setStockType] = useState<'in' | 'out'>('in');
  const [selectedProduct, setSelectedProduct] = useState<FinishedProduct | null>(null);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [txDrawerOpen, setTxDrawerOpen] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [stockForm] = Form.useForm();

  const loadProducts = async (category?: string) => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (category) params.category = category;
      const response = await inventoryApi.listProducts(params);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await inventoryApi.listCategories();
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts(categoryFilter || undefined);
  }, [categoryFilter]);

  const handleAdd = async (values: any) => {
    try {
      await inventoryApi.createProduct(values);
      message.success('Product added');
      addForm.resetFields();
      setAddModalOpen(false);
      loadProducts(categoryFilter || undefined);
      loadCategories();
    } catch (error) {
      message.error('Failed to add product');
    }
  };

  const openEditModal = (product: FinishedProduct) => {
    setSelectedProduct(product);
    editForm.setFieldsValue({
      product_name: product.product_name,
      sku: product.sku,
      safety_stock: product.safety_stock,
      category: product.category || undefined,
    });
    setEditModalOpen(true);
  };

  const handleEdit = async (values: any) => {
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      await inventoryApi.updateProduct(selectedProduct.id, values);
      message.success('Product updated');
      setEditModalOpen(false);
      loadProducts(categoryFilter || undefined);
      loadCategories();
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      message.error(typeof detail === 'string' ? detail : 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await inventoryApi.deleteProduct(id);
      message.success('Product deleted');
      loadProducts(categoryFilter || undefined);
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  const openStockModal = (product: FinishedProduct, type: 'in' | 'out') => {
    setSelectedProduct(product);
    setStockType(type);
    stockForm.resetFields();
    setStockModalOpen(true);
  };

  const handleStockSubmit = async (values: any) => {
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      await inventoryApi.createTransaction({
        item_type: 'product',
        item_id: selectedProduct.id,
        transaction_type: stockType,
        quantity: values.quantity,
        reason: values.reason,
      });
      message.success(`Stock ${stockType === 'in' ? '入库' : '出库'}成功`);
      setStockModalOpen(false);
      loadProducts(categoryFilter || undefined);
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      message.error(typeof detail === 'string' ? detail : '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const showTransactions = async (product: FinishedProduct) => {
    setSelectedProduct(product);
    setTxDrawerOpen(true);
    setTxLoading(true);
    try {
      const res = await inventoryApi.listTransactions({ item_type: 'product', item_id: product.id, limit: 50 });
      setTransactions(res.data);
    } catch (error) {
      message.error('Failed to load transactions');
    } finally {
      setTxLoading(false);
    }
  };

  const openPhotoModal = (product: FinishedProduct) => {
    setSelectedProduct(product);
    setPhotoModalOpen(true);
  };

  const handlePhotoUpload = async (file: File) => {
    if (!selectedProduct) return;
    setPhotoUploading(true);
    try {
      await inventoryApi.uploadProductPhoto(selectedProduct.id, file);
      message.success('Photo uploaded');
      loadProducts(categoryFilter || undefined);
      const updated = await inventoryApi.listProducts({ limit: 100 });
      const refreshed = updated.data.find(p => p.id === selectedProduct.id);
      if (refreshed) setSelectedProduct(refreshed);
    } catch (error) {
      message.error('Failed to upload photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleRemovePhoto = async (photoUrl: string) => {
    if (!selectedProduct) return;
    try {
      await inventoryApi.removeProductPhoto(selectedProduct.id, photoUrl);
      message.success('Photo removed');
      loadProducts(categoryFilter || undefined);
      const updated = await inventoryApi.listProducts({ limit: 100 });
      const refreshed = updated.data.find(p => p.id === selectedProduct.id);
      if (refreshed) setSelectedProduct(refreshed);
    } catch (error) {
      message.error('Failed to remove photo');
    }
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      await inventoryApi.createCategory(name);
      message.success('Category added');
      setNewCategoryName('');
      loadCategories();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await inventoryApi.deleteCategory(id);
      message.success('Category deleted');
      loadCategories();
    } catch (error) {
      message.error('Failed to delete category');
    }
  };

  const getPhotoList = (photos: string | null | undefined): string[] => {
    if (!photos) return [];
    return photos.split(',').filter(Boolean);
  };

  const columns = [
    {
      title: 'Photo',
      key: 'photo',
      width: 80,
      render: (_: any, record: FinishedProduct) => {
        const photos = getPhotoList(record.photos);
        return photos.length > 0 ? (
          <Image src={photos[0]} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
        ) : (
          <div style={{ width: 50, height: 50, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 10 }}>No</div>
        );
      },
    },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Product Name', dataIndex: 'product_name', key: 'product_name' },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string | null) => cat ? <Tag color="blue">{cat}</Tag> : <Tag>未分类</Tag>,
    },
    {
      title: 'Current Stock',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (stock: number, record: FinishedProduct) => (
        <Tag color={stock < record.safety_stock ? 'red' : 'green'}>{stock}</Tag>
      ),
    },
    { title: 'Safety Stock', dataIndex: 'safety_stock', key: 'safety_stock' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: FinishedProduct) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>编辑</Button>
          <Button size="small" type="primary" icon={<ArrowDownOutlined />} onClick={() => openStockModal(record, 'in')}>入库</Button>
          <Button size="small" danger icon={<ArrowUpOutlined />} onClick={() => openStockModal(record, 'out')}>出库</Button>
          <Button size="small" icon={<HistoryOutlined />} onClick={() => showTransactions(record)}>记录</Button>
          <Button size="small" icon={<UploadOutlined />} onClick={() => openPhotoModal(record)}>照片</Button>
          <Popconfirm title="确定删除该产品？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const txColumns = [
    {
      title: 'Type',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      render: (t: string) => <Tag color={t === 'in' ? 'green' : 'red'}>{t === 'in' ? '入库' : '出库'}</Tag>,
    },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Reason', dataIndex: 'reason', key: 'reason', render: (r: string) => r || '-' },
    { title: 'Date', dataIndex: 'transaction_date', key: 'transaction_date' },
  ];

  const filtered = products.filter(
    (p) =>
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const photos = selectedProduct ? getPhotoList(selectedProduct.photos) : [];

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.name }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Products</h2>
        <Space>
          <Select
            placeholder="All Categories"
            allowClear
            style={{ width: 160 }}
            value={categoryFilter || undefined}
            onChange={(v) => setCategoryFilter(v || '')}
            options={categoryOptions}
          />
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button icon={<TagsOutlined />} onClick={() => setCategoryModalOpen(true)}>管理分类</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>Add Product</Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={filtered} loading={loading} rowKey="id" />

      <Modal title="Add Product" open={addModalOpen} onCancel={() => setAddModalOpen(false)} onOk={() => addForm.submit()}>
        <Form form={addForm} onFinish={handleAdd} layout="vertical">
          <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="product_name" label="Product Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Select allowClear placeholder="Select category" options={categoryOptions} />
          </Form.Item>
          <Form.Item name="safety_stock" label="Safety Stock" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Edit Product" open={editModalOpen} onCancel={() => setEditModalOpen(false)} onOk={() => editForm.submit()} confirmLoading={submitting}>
        <Form form={editForm} onFinish={handleEdit} layout="vertical">
          <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="product_name" label="Product Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Select allowClear placeholder="Select category" options={categoryOptions} />
          </Form.Item>
          <Form.Item name="safety_stock" label="Safety Stock" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${stockType === 'in' ? '入库' : '出库'} - ${selectedProduct?.product_name}`}
        open={stockModalOpen}
        onCancel={() => setStockModalOpen(false)}
        onOk={() => stockForm.submit()}
        confirmLoading={submitting}
      >
        <Form form={stockForm} layout="vertical" onFinish={handleStockSubmit}>
          <Form.Item name="quantity" label="数量" rules={[{ required: true, message: '请输入数量' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="备注">
            <Input.TextArea rows={2} placeholder="入库/出库原因" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`${selectedProduct?.product_name} - 库存记录`}
        open={txDrawerOpen}
        onClose={() => setTxDrawerOpen(false)}
        width={600}
      >
        <Table columns={txColumns} dataSource={transactions} loading={txLoading} rowKey="id" pagination={false} size="small" />
      </Drawer>

      <Modal
        title={`${selectedProduct?.product_name} - 产品照片`}
        open={photoModalOpen}
        onCancel={() => setPhotoModalOpen(false)}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Upload showUploadList={false} accept="image/*" customRequest={({ file }) => handlePhotoUpload(file as File)}>
            <Button icon={<UploadOutlined />} loading={photoUploading}>上传照片</Button>
          </Upload>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {photos.map((url, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <Image src={url} width={120} height={120} style={{ objectFit: 'cover', borderRadius: 4 }} />
              <Button type="primary" danger size="small" icon={<DeleteOutlined />} style={{ position: 'absolute', top: 4, right: 4 }} onClick={() => handleRemovePhoto(url)} />
            </div>
          ))}
          {photos.length === 0 && <span style={{ color: '#999' }}>暂无照片</span>}
        </div>
      </Modal>

      <Modal
        title="管理产品分类"
        open={categoryModalOpen}
        onCancel={() => { setCategoryModalOpen(false); setNewCategoryName(''); }}
        footer={null}
        width={500}
      >
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Input
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onPressEnter={handleAddCategory}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>添加</Button>
        </div>
        <Table
          dataSource={categories}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            { title: 'Category Name', dataIndex: 'name', key: 'name' },
            {
              title: 'Action',
              key: 'action',
              width: 80,
              render: (_: any, record: Category) => (
                <Popconfirm title="Delete this category?" onConfirm={() => handleDeleteCategory(record.id)}>
                  <Button type="link" danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default ProductList;
