import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Spin } from 'antd';
import { UserOutlined, RiseOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import client from '../../api/client';

interface CustomerAnalytics {
  total_customers: number;
  new_this_month: number;
  value_ranking: Array<{
    id: number;
    name: string;
    level: string;
    order_count: number;
    total_amount: number;
  }>;
  growth_trend: Array<{
    period: string;
    count: number;
  }>;
  activity: Array<{
    id: number;
    name: string;
    last_order_date: string;
    order_count: number;
    status: string;
  }>;
}

const activityColors: Record<string, string> = {
  active: 'green',
  inactive: 'orange',
  dormant: 'red',
  new: 'blue',
};

const CustomerAnalyticsPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<CustomerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await client.get('/analytics/customers');
        setData(res.data);
      } catch (error) {
        console.error('Failed to load customer analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!data) return null;

  const activityLabels: Record<string, string> = {
    active: t('customers.active'),
    inactive: t('customers.inactive'),
    dormant: t('customers.dormant'),
    new: t('customers.new_customer'),
  };

  const valueColumns = [
    { title: '#', key: 'rank', render: (_: any, __: any, index: number) => index + 1 },
    { title: t('customers.name'), dataIndex: 'name', key: 'name' },
    { title: t('customers.level'), dataIndex: 'level', key: 'level', render: (v: string) => v || '-' },
    { title: t('customers.order_count'), dataIndex: 'order_count', key: 'order_count' },
    { title: t('customers.total_amount'), dataIndex: 'total_amount', key: 'total_amount', render: (v: number) => `¥${v.toLocaleString()}` },
  ];

  const activityColumns = [
    { title: t('customers.name'), dataIndex: 'name', key: 'name' },
    { title: t('customers.last_order'), dataIndex: 'last_order_date', key: 'last_order_date' },
    { title: t('customers.order_count'), dataIndex: 'order_count', key: 'order_count' },
    {
      title: t('customers.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={activityColors[status] ?? 'default'}>{activityLabels[status] ?? status}</Tag>
      ),
    },
  ];

  return (
    <div>
      <h2>{t('customers.analytics')}</h2>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card>
            <Statistic title={t('customers.total_customers')} value={data.total_customers} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic title={t('customers.new_this_month')} value={data.new_this_month} prefix={<RiseOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card title={t('customers.growth_trend')}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.growth_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" name={t('customers.new_customers')} stroke="#1890ff" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title={t('customers.value_ranking')}>
            <Table columns={valueColumns} dataSource={data.value_ranking} rowKey="id" pagination={false} size="small" />
          </Card>
        </Col>
        <Col span={12}>
          <Card title={t('customers.activity')}>
            <Table columns={activityColumns} dataSource={data.activity} rowKey="id" pagination={false} size="small" />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerAnalyticsPage;
