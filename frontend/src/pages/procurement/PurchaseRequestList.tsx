import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, Drawer, message, Popconfirm, AutoComplete } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, SendOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { procurementApi, PurchaseRequest, PurchaseRequestItem } from '../../api/procurement';
import { inventoryApi, Material, FinishedProduct } from '../../api/inventory';
import { debounce } from '../../utils/debounce';

const statusColors: Record<string, string> = {
  draft: 'default',
  pending_approval: 'orange',
  approved: 'green',
  rejected: 'red',
  completed: 'blue',
};

const PurchaseRequestList = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailItems, setDetailItems] = useState<PurchaseRequestItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form] = Form.useForm();

  const [materialOptions, setMaterialOptions] = useState<any[]>([]);
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<any[]>([]);
  const [supplierMap, setSupplierMap] = useState<Record<number, string>>({});
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<Record<number, Material>>({});
  const [selectedProducts, setSelectedProducts] = useState<Record<number, FinishedProduct>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await procurementApi.listRequests({ limit: 100 });
      setData(res.data);
    } catch {
      message.error(t('common.failed_to_load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); loadSuppliers(); }, []);

  const loadSuppliers = async () => {
    try {
      const res = await procurementApi.listSuppliers({ limit: 200 });
      const map: Record<number, string> = {};
      res.data.forEach((s) => { map[s.id] = s.code ? `${s.code} - ${s.name}` : s.name; });
      setSupplierMap(map);
    } catch {}
  };

  const searchSuppliers = useCallback(
    debounce(async (q: string) => {
      if (!q) { setSupplierOptions([]); return; }
      try {
        const res = await procurementApi.searchSuppliers(q);
        setSupplierOptions(res.data.map((s) => ({ value: s.name, label: `${s.code ? s.code + ' - ' : ''}${s.name}`, data: s })));
      } catch { setSupplierOptions([]); }
    }, 300), []
  );

  const handleSelectSupplier = (value: string) => {
    const opt = supplierOptions.find((o) => o.value === value);
    if (opt?.data) setSelectedSupplierId(opt.data.id);
  };

  const searchMaterials = useCallback(
    debounce(async (q: string) => {
      if (!q) { setMaterialOptions([]); return; }
      try {
        const res = await inventoryApi.searchMaterials(q);
        setMaterialOptions(
          res.data.map((m) => ({ value: m.name, label: `${m.code} - ${m.name}`, data: m }))
        );
      } catch { setMaterialOptions([]); }
    }, 300),
    []
  );

  const searchProducts = useCallback(
    debounce(async (q: string) => {
      if (!q) { setProductOptions([]); return; }
      try {
        const res = await inventoryApi.searchProducts(q);
        setProductOptions(
          res.data.map((p) => ({ value: p.product_name, label: `${p.sku} - ${p.product_name}`, data: p }))
        );
      } catch { setProductOptions([]); }
    }, 300),
    []
  );

  const handleSelectMaterial = (fieldIndex: number, value: string) => {
    const opt = materialOptions.find((o) => o.value === value);
    if (opt?.data) {
      setSelectedMaterials((prev) => ({ ...prev, [fieldIndex]: opt.data }));
    }
  };

  const handleSelectProduct = (fieldIndex: number, value: string) => {
    const opt = productOptions.find((o) => o.value === value);
    if (opt?.data) {
      setSelectedProducts((prev) => ({ ...prev, [fieldIndex]: opt.data }));
    }
  };

  const handleCreate = async (values: any) => {
    setSubmitting(true);
    try {
      const items = (values.items || []).map((item: any, index: number) => {
        const itemType = item.item_type || 'material';
        if (itemType === 'product') {
          const product = selectedProducts[index];
          return {
            item_type: 'product',
            material_id: null,
            product_id: product?.id || null,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
          };
        }
        const material = selectedMaterials[index];
        return {
          item_type: 'material',
          material_id: material?.id || null,
          product_id: null,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        };
      });
      await procurementApi.createRequest({
        supplier_id: selectedSupplierId || values.supplier_id,
        remarks: values.remarks,
        items,
      });
      message.success(t('common.save'));
      setModalOpen(false);
      form.resetFields();
      setSelectedMaterials({});
      setSelectedProducts({});
      setSelectedSupplierId(null);
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitApproval = async (id: number) => {
    try {
      await procurementApi.submitRequest(id);
      message.success(t('procurement.submit_approval'));
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await procurementApi.deleteRequest(id);
      message.success(t('common.delete'));
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    }
  };

  const showDetail = async (id: number) => {
    setDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await procurementApi.getRequest(id);
      setDetailItems(res.data.items || []);
    } catch {
      message.error(t('common.failed_to_load'));
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    { title: t('procurement.request_no'), dataIndex: 'request_no', key: 'request_no' },
    { title: t('procurement.supplier_name'), dataIndex: 'supplier_id', key: 'supplier_id', render: (id: number) => supplierMap[id] || id },
    {
      title: t('procurement.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status] ?? 'default'}>{status}</Tag>,
    },
    { title: t('procurement.amount'), dataIndex: 'total_amount', key: 'total_amount', render: (val: number) => val?.toFixed(2) },
    { title: t('common.created_at'), dataIndex: 'created_at', key: 'created_at', render: (val: string) => val?.slice(0, 19)?.replace('T', ' ') },
    {
      title: t('common.actions'),
      key: 'action',
      render: (_: any, record: PurchaseRequest) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => showDetail(record.id)}>{t('common.view')}</Button>
          {record.status === 'draft' && (
            <Popconfirm title={t('common.confirm')} onConfirm={() => handleSubmitApproval(record.id)}>
              <Button size="small" icon={<SendOutlined />}>{t('procurement.submit_approval')}</Button>
            </Popconfirm>
          )}
          {record.status === 'draft' && (
            <Popconfirm title={t('common.confirm')} onConfirm={() => handleDelete(record.id)}>
              <Button size="small" danger icon={<DeleteOutlined />}>{t('common.delete')}</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const itemColumns = [
    { title: t('procurement.material'), dataIndex: 'item_type', key: 'item_type', render: (val: string) => val === 'material' ? t('procurement.material') : t('procurement.product') },
    { title: 'ID', key: 'ref_id', render: (_: any, record: PurchaseRequestItem) => record.item_type === 'material' ? record.material_id : record.product_id },
    { title: t('procurement.quantity'), dataIndex: 'quantity', key: 'quantity' },
    { title: t('procurement.unit_price'), dataIndex: 'unit_price', key: 'unit_price', render: (val: number) => val?.toFixed(2) },
    {
      title: t('procurement.amount'),
      key: 'amount',
      render: (_: any, record: PurchaseRequestItem) => ((record.quantity * record.unit_price) || 0).toFixed(2),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>{t('procurement.requests')}</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setSelectedMaterials({}); setSelectedProducts({}); setSelectedSupplierId(null); setModalOpen(true); }}>
          {t('procurement.create_request')}
        </Button>
      </div>
      <Table columns={columns} dataSource={data} loading={loading} rowKey="id" />

      <Modal
        title={t('procurement.create_request')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="supplier_name" label={t('procurement.supplier_name')} rules={[{ required: true }]}>
            <AutoComplete options={supplierOptions} onSearch={searchSuppliers} onSelect={handleSelectSupplier} placeholder={t('procurement.supplier_name')} filterOption={false} />
          </Form.Item>
          <Form.Item name="remarks" label={t('common.remarks')}>
            <Input />
          </Form.Item>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>{t('procurement.items')}</div>
                {fields.map((field) => (
                  <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item {...field} name={[field.name, 'item_type']} rules={[{ required: true }]}>
                      <Select options={[{ value: 'material', label: t('procurement.material') }, { value: 'product', label: t('procurement.product') }]} style={{ width: 110 }} placeholder={t('procurement.material')} />
                    </Form.Item>
                    <Form.Item shouldUpdate={(prev, cur) => prev.items?.[field.name]?.item_type !== cur.items?.[field.name]?.item_type} noStyle>
                      {({ getFieldValue }) => {
                        const itemType = getFieldValue(['items', field.name, 'item_type']) || 'material';
                        if (itemType === 'product') {
                          return (
                            <Form.Item {...field} name={[field.name, 'product_name']} rules={[{ required: true }]}>
                              <AutoComplete
                                options={productOptions}
                                onSearch={searchProducts}
                                onSelect={(val) => handleSelectProduct(field.name, val)}
                                placeholder={t('procurement.product')}
                                style={{ width: 200 }}
                                filterOption={false}
                              />
                            </Form.Item>
                          );
                        }
                        return (
                          <Form.Item {...field} name={[field.name, 'material_name']} rules={[{ required: true }]}>
                            <AutoComplete
                              options={materialOptions}
                              onSearch={searchMaterials}
                              onSelect={(val) => handleSelectMaterial(field.name, val)}
                              placeholder={t('procurement.material')}
                              style={{ width: 200 }}
                              filterOption={false}
                            />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'quantity']} rules={[{ required: true }]}>
                      <InputNumber placeholder={t('procurement.quantity')} min={1} style={{ width: 90 }} />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'unit_price']} rules={[{ required: true }]}>
                      <InputNumber placeholder={t('procurement.unit_price')} min={0} precision={2} style={{ width: 100 }} />
                    </Form.Item>
                    <Button icon={<DeleteOutlined />} onClick={() => remove(field.name)} danger />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  {t('procurement.add_item')}
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Drawer
        title={t('procurement.items')}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={600}
      >
        <Table columns={itemColumns} dataSource={detailItems} loading={detailLoading} rowKey="id" pagination={false} />
      </Drawer>
    </div>
  );
};

export default PurchaseRequestList;
