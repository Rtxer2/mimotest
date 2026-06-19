import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Select, Button, message, Popconfirm, Space } from 'antd';
import { SendOutlined, FileExcelOutlined, FilePdfOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { orderApi, Order, OrderItem } from '../../api/orders';
import { approvalApi } from '../../api/approvals';
import { reportApi } from '../../api/reports';

const statusOptions = ['pending', 'confirmed', 'in_production', 'completed', 'cancelled'];

const statusColors: Record<string, string> = {
  pending: 'default',
  pending_approval: 'orange',
  confirmed: 'blue',
  in_production: 'cyan',
  completed: 'green',
  cancelled: 'red',
};

const OrderDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<(Order & { items: OrderItem[] }) | null>(null);
  const [approvalRecords, setApprovalRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const statusLabels: Record<string, string> = {
    pending: t('orders.status_pending'),
    pending_approval: t('orders.status_pending_approval'),
    confirmed: t('orders.status_confirmed'),
    in_production: t('orders.status_in_production'),
    completed: t('orders.status_completed'),
    cancelled: t('orders.status_cancelled'),
  };

  const loadOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await orderApi.get(parseInt(id));
      setOrder(response.data);
      try {
        const recordsRes = await approvalApi.getRecordsByBusiness('order', parseInt(id));
        setApprovalRecords(recordsRes.data);
      } catch {
        setApprovalRecords([]);
      }
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await orderApi.updateStatus(parseInt(id), status);
      message.success(t('orders.status_updated'));
      loadOrder();
    } catch (error) {
      message.error(t('orders.status_update_failed'));
    }
  };

  const handleSubmitApproval = async () => {
    if (!id) return;
    try {
      await orderApi.submitForApproval(parseInt(id));
      message.success(t('orders.submitted_for_approval'));
      loadOrder();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || t('orders.submit_approval_failed'));
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    try {
      await orderApi.updateStatus(parseInt(id), 'completed');
      message.success(t('orders.status_completed'));
      loadOrder();
    } catch {
      message.error(t('orders.status_update_failed'));
    }
  };

  const handleExport = async (format: string) => {
    if (!id) return;
    try {
      const res = await reportApi.exportOrder(parseInt(id), format);
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order_${id}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      message.error(t('reports.export_failed'));
    }
  };

  if (!order) return null;

  const itemColumns = [
    { title: t('orders.product_name'), dataIndex: 'product_name', key: 'product_name' },
    { title: t('orders.quantity'), dataIndex: 'quantity', key: 'quantity' },
    {
      title: t('orders.unit_price'),
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (val?: string | number) => (val != null ? `¥${Number(val).toFixed(2)}` : '-'),
    },
    { title: t('orders.specs'), dataIndex: 'specs', key: 'specs' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>{t('orders.detail_title')}</h2>
        <Space>
          <Button icon={<FileExcelOutlined />} onClick={() => handleExport('xlsx')}>{t('reports.excel')}</Button>
          <Button icon={<FilePdfOutlined />} onClick={() => handleExport('pdf')}>{t('reports.pdf')}</Button>
          {order.status === 'pending' && (
            <Popconfirm title={t('orders.confirm_submit_approval')} onConfirm={handleSubmitApproval}>
              <Button type="primary" icon={<SendOutlined />}>{t('orders.submit_approval')}</Button>
            </Popconfirm>
          )}
          {(order.status === 'confirmed' || order.status === 'in_production') && (
            <Popconfirm title={t('orders.confirm_complete')} onConfirm={handleComplete}>
              <Button type="primary" icon={<CheckCircleOutlined />}>{t('orders.complete_order')}</Button>
            </Popconfirm>
          )}
        </Space>
      </div>
      <Card loading={loading}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label={t('orders.order_number')}>{order.order_no}</Descriptions.Item>
          <Descriptions.Item label={t('orders.customer_id')}>{order.customer_id}</Descriptions.Item>
          <Descriptions.Item label={t('orders.total_amount')}>
            {order.total_amount != null ? `¥${Number(order.total_amount).toFixed(2)}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('orders.delivery_date')}>{order.delivery_date ?? '-'}</Descriptions.Item>
          <Descriptions.Item label={t('orders.status')}>
            <Tag color={statusColors[order.status] ?? 'default'}>
              {statusLabels[order.status] ?? order.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('common.created_at')}>{order.created_at}</Descriptions.Item>
          <Descriptions.Item label={t('orders.remarks')} span={2}>{order.remarks ?? '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {order.status !== 'pending_approval' && (
        <Card title={t('orders.change_status')} style={{ marginTop: 16 }}>
          <Select
            value={order.status}
            onChange={handleStatusChange}
            style={{ width: 200 }}
            options={statusOptions.map((s) => ({ label: statusLabels[s] ?? s, value: s }))}
          />
        </Card>
      )}

      <Card title={t('orders.order_items')} style={{ marginTop: 16 }}>
        <Table columns={itemColumns} dataSource={order.items} rowKey="id" pagination={false} />
      </Card>

      {approvalRecords.length > 0 && (
        <Card title={t('orders.approval_records')} style={{ marginTop: 16 }}>
          <Table
            columns={[
              { title: t('orders.approval_node'), dataIndex: 'node_name', key: 'node_name' },
              {
                title: t('common.operation'),
                dataIndex: 'action',
                key: 'action',
                render: (action: string) => (
                  <Tag color={action === 'approve' ? 'green' : 'red'}>
                    {action === 'approve' ? t('orders.action_approve') : t('orders.action_reject')}
                  </Tag>
                ),
              },
              { title: t('orders.approver_id'), dataIndex: 'approver_id', key: 'approver_id' },
              { title: t('common.remark'), dataIndex: 'comment', key: 'comment', render: (v: string) => v || '-' },
              { title: t('common.time'), dataIndex: 'created_at', key: 'created_at' },
            ]}
            dataSource={approvalRecords}
            rowKey="id"
            pagination={false}
            onRow={(record) => ({
              style: record.action === 'reject' ? { background: '#fff2f0' } : {},
            })}
          />
        </Card>
      )}
    </div>
  );
};

export default OrderDetail;
