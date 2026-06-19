import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, Drawer, message, AutoComplete } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, ImportOutlined, RollbackOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { procurementApi, PurchaseOrder, PurchaseOrderItem } from '../../api/procurement';
import { inventoryApi } from '../../api/inventory';
import { debounce } from '../../utils/debounce';

const statusColors: Record<string, string> = {
  pending: 'default',
  ordered: 'blue',
  inspecting: 'orange',
  received: 'green',
  cancelled: 'red',
};

const PurchaseOrderList = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailItems, setDetailItems] = useState<PurchaseOrderItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [receivingOrderId, setReceivingOrderId] = useState<number | null>(null);
  const [receiveItems, setReceiveItems] = useState<PurchaseOrderItem[]>([]);
  const [form] = Form.useForm();
  const [receiveForm] = Form.useForm();
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnOrder, setReturnOrder] = useState<PurchaseOrder | null>(null);
  const [returnItems, setReturnItems] = useState<PurchaseOrderItem[]>([]);
  const [returnForm] = Form.useForm();
  const [materialOptions, setMaterialOptions] = useState<any[]>([]);
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<any[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<Record<number, any>>({});
  const [selectedProducts, setSelectedProducts] = useState<Record<number, any>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await procurementApi.listOrders({ limit: 100 });
      setData(res.data);
    } catch {
      message.error(t('common.failed_to_load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const searchSuppliers = useCallback(
    debounce(async (q: string) => {
      if (!q) { setSupplierOptions([]); return; }
      try {
        const res = await procurementApi.searchSuppliers(q);
        setSupplierOptions(res.data.map((s) => ({ value: s.name, label: `${s.name} (${s.contact_person})`, data: s })));
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
        setMaterialOptions(res.data.map((m) => ({ value: m.name, label: `${m.name} (${m.code})`, data: m })));
      } catch { setMaterialOptions([]); }
    }, 300), []
  );

  const searchProducts = useCallback(
    debounce(async (q: string) => {
      if (!q) { setProductOptions([]); return; }
      try {
        const res = await inventoryApi.searchProducts(q);
        setProductOptions(res.data.map((p) => ({ value: p.product_name, label: `${p.product_name} (${p.sku})`, data: p })));
      } catch { setProductOptions([]); }
    }, 300), []
  );

  const handleSelectMaterial = (fieldIndex: number, value: string) => {
    const opt = materialOptions.find((o) => o.value === value);
    if (opt?.data) setSelectedMaterials((prev) => ({ ...prev, [fieldIndex]: opt.data }));
  };

  const handleSelectProduct = (fieldIndex: number, value: string) => {
    const opt = productOptions.find((o) => o.value === value);
    if (opt?.data) setSelectedProducts((prev) => ({ ...prev, [fieldIndex]: opt.data }));
  };

  const handleCreate = async (values: any) => {
    setSubmitting(true);
    try {
      const items = (values.items || []).map((item: any, index: number) => {
        const itemType = item.item_type || 'material';
        if (itemType === 'product') {
          const product = selectedProducts[index];
          return { item_type: 'product', material_id: null, product_id: product?.id || null, quantity: Number(item.quantity), unit_price: Number(item.unit_price) };
        }
        const material = selectedMaterials[index];
        return { item_type: 'material', material_id: material?.id || null, product_id: null, quantity: Number(item.quantity), unit_price: Number(item.unit_price) };
      });
      await procurementApi.createOrder({
        supplier_id: selectedSupplierId || values.supplier_id,
        request_id: values.request_id,
        delivery_date: values.delivery_date,
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

  const showDetail = async (id: number) => {
    setDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await procurementApi.getOrder(id);
      setDetailItems(res.data.items || []);
    } catch {
      message.error(t('common.failed_to_load'));
    } finally {
      setDetailLoading(false);
    }
  };

  const openReceive = async (id: number) => {
    setReceivingOrderId(id);
    setReceiveModalOpen(true);
    try {
      const res = await procurementApi.getOrder(id);
      setReceiveItems(res.data.items || []);
    } catch {
      message.error(t('common.failed_to_load'));
    }
  };

  const handleReceive = async (values: any) => {
    if (!receivingOrderId) return;
    setSubmitting(true);
    try {
      const items = receiveItems.map((item, index) => ({
        item_id: item.id,
        pass_quantity: values.items?.[index]?.pass_quantity || 0,
        reject_quantity: values.items?.[index]?.reject_quantity || 0,
      })).filter((i) => i.pass_quantity > 0 || i.reject_quantity > 0);
      await procurementApi.receiveItems(receivingOrderId, items);
      message.success(t('procurement.receive'));
      setReceiveModalOpen(false);
      setReceivingOrderId(null);
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const openReturnModal = async (order: PurchaseOrder) => {
    setReturnOrder(order);
    setReturnModalOpen(true);
    returnForm.resetFields();
    try {
      const res = await procurementApi.getOrder(order.id);
      setReturnItems(res.data.items || []);
    } catch {
      message.error(t('common.failed_to_load'));
    }
  };

  const handleReturn = async (values: any) => {
    if (!returnOrder) return;
    setSubmitting(true);
    try {
      const items = (values.items || []).filter((i: any) => i.quantity > 0);
      await procurementApi.createReturn({
        order_id: returnOrder.id,
        supplier_id: returnOrder.supplier_id,
        reason: values.reason,
        items,
      });
      message.success(t('procurement.create_return'));
      setReturnModalOpen(false);
      setReturnOrder(null);
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: t('procurement.order_no'), dataIndex: 'order_no', key: 'order_no' },
    { title: t('procurement.supplier_name'), dataIndex: 'supplier_id', key: 'supplier_id' },
    {
      title: t('procurement.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status] ?? 'default'}>{status}</Tag>,
    },
    { title: t('procurement.amount'), dataIndex: 'total_amount', key: 'total_amount', render: (val: number) => val?.toFixed(2) },
    { title: t('procurement.delivery_date'), dataIndex: 'delivery_date', key: 'delivery_date' },
    { title: t('common.created_at'), dataIndex: 'created_at', key: 'created_at', render: (val: string) => val?.slice(0, 19)?.replace('T', ' ') },
    {
      title: t('common.actions'),
      key: 'action',
      render: (_: any, record: PurchaseOrder) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => showDetail(record.id)}>{t('common.view')}</Button>
          {record.status === 'ordered' && (
            <Button size="small" icon={<ImportOutlined />} onClick={() => openReceive(record.id)}>{t('procurement.receive')}</Button>
          )}
          {(record.status === 'received' || record.status === 'inspecting') && (
            <Button size="small" icon={<RollbackOutlined />} onClick={() => openReturnModal(record)}>{t('procurement.create_return')}</Button>
          )}
        </Space>
      ),
    },
  ];

  const itemColumns = [
    { title: t('procurement.material'), key: 'item_type', render: (_: any, record: PurchaseOrderItem) => record.item_type === 'material' ? t('procurement.material') : t('procurement.product') },
    { title: 'ID', key: 'ref_id', render: (_: any, record: PurchaseOrderItem) => record.material_id ?? record.product_id },
    { title: t('procurement.quantity'), dataIndex: 'quantity', key: 'quantity' },
    { title: t('procurement.unit_price'), dataIndex: 'unit_price', key: 'unit_price', render: (val: number) => val?.toFixed(2) },
    { title: t('procurement.received_quantity'), dataIndex: 'received_quantity', key: 'received_quantity' },
    {
      title: t('procurement.amount'),
      key: 'amount',
      render: (_: any, record: PurchaseOrderItem) => ((record.quantity * record.unit_price) || 0).toFixed(2),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>{t('procurement.orders')}</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setSelectedMaterials({}); setSelectedProducts({}); setSelectedSupplierId(null); setModalOpen(true); }}>
          {t('procurement.create_order')}
        </Button>
      </div>
      <Table columns={columns} dataSource={data} loading={loading} rowKey="id" />

      <Modal
        title={t('procurement.create_order')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="supplier_name" label={t('procurement.supplier_name')} rules={[{ required: true }]}>
            <AutoComplete options={supplierOptions} onSearch={searchSuppliers} onSelect={handleSelectSupplier} placeholder={t('procurement.supplier_name')} filterOption={false} />
          </Form.Item>
          <Form.Item name="request_id" label={t('procurement.request_no')}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="delivery_date" label={t('procurement.delivery_date')}>
            <Input />
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
                      <Select options={[{ value: 'material', label: t('procurement.material') }, { value: 'product', label: t('procurement.product') }]} style={{ width: 120 }} placeholder={t('procurement.material')} />
                    </Form.Item>
                    <Form.Item shouldUpdate={(prev, cur) => prev.items?.[field.name]?.item_type !== cur.items?.[field.name]?.item_type} noStyle>
                      {({ getFieldValue }) => {
                        const itemType = getFieldValue(['items', field.name, 'item_type']) || 'material';
                        if (itemType === 'product') {
                          return (
                            <Form.Item {...field} name={[field.name, 'product_name']} rules={[{ required: true }]}>
                              <AutoComplete options={productOptions} onSearch={searchProducts} onSelect={(val) => handleSelectProduct(field.name, val)} placeholder={t('procurement.product')} style={{ width: 200 }} filterOption={false} />
                            </Form.Item>
                          );
                        }
                        return (
                          <Form.Item {...field} name={[field.name, 'material_name']} rules={[{ required: true }]}>
                            <AutoComplete options={materialOptions} onSearch={searchMaterials} onSelect={(val) => handleSelectMaterial(field.name, val)} placeholder={t('procurement.material')} style={{ width: 200 }} filterOption={false} />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'quantity']} rules={[{ required: true }]}>
                      <InputNumber placeholder={t('procurement.quantity')} min={1} />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'unit_price']} rules={[{ required: true }]}>
                      <InputNumber placeholder={t('procurement.unit_price')} min={0} precision={2} />
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

      <Modal
        title={t('procurement.receive')}
        open={receiveModalOpen}
        onCancel={() => { setReceiveModalOpen(false); setReceivingOrderId(null); }}
        onOk={() => receiveForm.submit()}
        confirmLoading={submitting}
        width={640}
      >
        <Form form={receiveForm} layout="vertical" onFinish={handleReceive}>
          <Form.List name="items">
            {() => (
              <>
                {receiveItems.map((item, index) => (
                  <Space key={item.id} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                    <span>{t('procurement.material')} #{item.material_id ?? item.product_id} ({t('procurement.quantity')}: {item.quantity})</span>
                    <Form.Item name={[index, 'pass_quantity']} noStyle>
                      <InputNumber min={0} placeholder={t('procurement.pass_quantity')} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item name={[index, 'reject_quantity']} noStyle>
                      <InputNumber min={0} placeholder={t('procurement.reject_quantity')} style={{ width: 120 }} />
                    </Form.Item>
                  </Space>
                ))}
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
      <Modal
        title={t('procurement.create_return')}
        open={returnModalOpen}
        onCancel={() => { setReturnModalOpen(false); setReturnOrder(null); }}
        onOk={() => returnForm.submit()}
        confirmLoading={submitting}
        width={640}
      >
        <Form form={returnForm} layout="vertical" onFinish={handleReturn}>
          <Form.Item name="reason" label={t('procurement.return_reason')}>
            <Input />
          </Form.Item>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>{t('procurement.items')}</div>
                {fields.map((field) => (
                  <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item {...field} name={[field.name, 'order_item_id']} rules={[{ required: true }]}>
                      <Select
                        style={{ width: 200 }}
                        placeholder={t('procurement.material')}
                        options={returnItems.map((item) => ({
                          value: item.id,
                          label: `${item.material_id ?? item.product_id} (${t('procurement.quantity')}: ${item.quantity})`,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'quantity']} rules={[{ required: true }]}>
                      <InputNumber min={1} placeholder={t('procurement.quantity')} />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'reason']}>
                      <Input placeholder={t('procurement.return_reason')} />
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
    </div>
  );
};

export default PurchaseOrderList;
