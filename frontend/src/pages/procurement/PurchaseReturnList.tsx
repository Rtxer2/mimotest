import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Drawer, message, Popconfirm } from 'antd';
import { EyeOutlined, CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { procurementApi, PurchaseReturn, PurchaseReturnItem } from '../../api/procurement';

const statusColors: Record<string, string> = {
  pending: 'orange',
  completed: 'green',
};

const PurchaseReturnList = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<PurchaseReturn[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailItems, setDetailItems] = useState<PurchaseReturnItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await procurementApi.listReturns({ limit: 100 });
      setData(res.data);
    } catch {
      message.error(t('common.failed_to_load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const showDetail = async (id: number) => {
    setDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await procurementApi.getReturn(id);
      setDetailItems(res.data.items || []);
    } catch {
      message.error(t('common.failed_to_load'));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await procurementApi.completeReturn(id);
      message.success(t('procurement.complete_return'));
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('common.operation_failed'));
    }
  };

  const columns = [
    { title: t('procurement.return_no'), dataIndex: 'return_no', key: 'return_no' },
    { title: t('procurement.order_no'), dataIndex: 'order_id', key: 'order_id' },
    { title: t('procurement.supplier_name'), dataIndex: 'supplier_name', key: 'supplier_name' },
    {
      title: t('procurement.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status] ?? 'default'}>{status}</Tag>,
    },
    { title: t('procurement.return_reason'), dataIndex: 'reason', key: 'reason' },
    { title: t('common.created_at'), dataIndex: 'created_at', key: 'created_at', render: (val: string) => val?.slice(0, 19)?.replace('T', ' ') },
    {
      title: t('common.actions'),
      key: 'action',
      render: (_: any, record: PurchaseReturn) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => showDetail(record.id)}>{t('common.view')}</Button>
          {record.status === 'pending' && (
            <Popconfirm title={t('common.confirm')} onConfirm={() => handleComplete(record.id)}>
              <Button size="small" icon={<CheckOutlined />}>{t('procurement.complete_return')}</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const itemColumns = [
    { title: t('procurement.order_no'), dataIndex: 'order_item_id', key: 'order_item_id' },
    { title: t('procurement.quantity'), dataIndex: 'quantity', key: 'quantity' },
    { title: t('procurement.return_reason'), dataIndex: 'reason', key: 'reason' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>{t('procurement.returns')}</h2>
      </div>
      <Table columns={columns} dataSource={data} loading={loading} rowKey="id" />

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

export default PurchaseReturnList;
