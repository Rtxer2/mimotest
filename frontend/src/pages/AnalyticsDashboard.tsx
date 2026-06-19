import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  InboxOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import client from '../api/client';
import { preferenceApi, DashboardConfig, DEFAULT_CONFIG } from '../api/preferences';

interface AnalyticsData {
  metrics: {
    total_customers: number;
    total_orders: number;
    total_order_amount: number;
    active_production_orders: number;
    low_stock_materials: number;
    pending_approvals: number;
  };
  order_trend: Array<{ period: string; count: number; amount: number }>;
  order_status_distribution: Array<{ status: string; count: number }>;
  production_stats: Array<{ status: string; count: number }>;
  inventory_stats: {
    total_materials: number;
    low_stock_materials: number;
    total_products: number;
    low_stock_products: number;
  };
  quality_stats: {
    total_inspections: number;
    passed: number;
    failed: number;
    open_issues: number;
  };
  approval_stats: {
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
  };
}

const PIE_COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2'];

const AnalyticsDashboard = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  const STATUS_LABELS: Record<string, string> = {
    pending: t('analytics.status_pending'),
    pending_approval: t('analytics.status_pending_approval'),
    confirmed: t('analytics.status_confirmed'),
    production: t('analytics.status_production'),
    in_progress: t('analytics.status_in_progress'),
    completed: t('analytics.status_completed'),
    cancelled: t('analytics.status_cancelled'),
    approved: t('analytics.status_approved'),
    rejected: t('analytics.status_rejected'),
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analyticsRes, prefRes] = await Promise.all([
          client.get('/analytics/dashboard'),
          preferenceApi.get(),
        ]);
        setData(analyticsRes.data);
        setConfig(prefRes.data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!data) return null;

  const orderStatusData = data.order_status_distribution.map((item) => ({
    name: STATUS_LABELS[item.status] ?? item.status,
    value: item.count,
  }));

  const productionData = data.production_stats.map((item) => ({
    name: STATUS_LABELS[item.status] ?? item.status,
    count: item.count,
  }));

  const qualityData = [
    { name: t('analytics.result_pass'), value: data.quality_stats.passed },
    { name: t('analytics.result_fail'), value: data.quality_stats.failed },
  ];

  const approvalData = [
    { name: t('analytics.status_pending_approval'), value: data.approval_stats.pending },
    { name: t('analytics.status_approved'), value: data.approval_stats.approved },
    { name: t('analytics.status_rejected'), value: data.approval_stats.rejected },
    { name: t('analytics.status_cancelled'), value: data.approval_stats.cancelled },
  ].filter((item) => item.value > 0);

  const hasTrendRow = config.analytics.order_trend || config.analytics.order_status;
  const hasBottomRow = config.analytics.production_stats || config.analytics.quality_stats || config.analytics.approval_stats;

  return (
    <div>
      <h2>{t('analytics.title')}</h2>

      {config.analytics.metrics && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}>
            <Card>
              <Statistic title={t('analytics.total_customers')} value={data.metrics.total_customers} prefix={<UserOutlined />} />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title={t('analytics.total_orders')} value={data.metrics.total_orders} prefix={<ShoppingCartOutlined />} />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title={t('analytics.total_order_amount')} value={data.metrics.total_order_amount} prefix="¥" precision={2} />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title={t('analytics.active_production_orders')} value={data.metrics.active_production_orders} prefix={<ToolOutlined />} />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title={t('analytics.low_stock_materials')} value={data.metrics.low_stock_materials} prefix={<InboxOutlined />} valueStyle={{ color: data.metrics.low_stock_materials > 0 ? '#ff4d4f' : undefined }} />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title={t('analytics.pending_approvals')} value={data.metrics.pending_approvals} prefix={<AuditOutlined />} valueStyle={{ color: data.metrics.pending_approvals > 0 ? '#faad14' : undefined }} />
            </Card>
          </Col>
        </Row>
      )}

      {hasTrendRow && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          {config.analytics.order_trend && (
            <Col span={config.analytics.order_status ? 16 : 24}>
              <Card title={t('analytics.order_trend')}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.order_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="count" name={t('analytics.order_count')} stroke="#1890ff" />
                    <Line yAxisId="right" type="monotone" dataKey="amount" name={t('analytics.amount')} stroke="#52c41a" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}
          {config.analytics.order_status && (
            <Col span={config.analytics.order_trend ? 8 : 24}>
              <Card title={t('analytics.order_status_distribution')}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={orderStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                      {orderStatusData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}
        </Row>
      )}

      {hasBottomRow && (
        <Row gutter={16}>
          {config.analytics.production_stats && (
            <Col span={8}>
              <Card title={t('analytics.production_order_stats')}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={productionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name={t('analytics.count')} fill="#1890ff" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}
          {config.analytics.quality_stats && (
            <Col span={8}>
              <Card title={t('analytics.quality_inspection')}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={qualityData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                      <Cell fill="#52c41a" />
                      <Cell fill="#ff4d4f" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  {t('analytics.total_inspections')}: {data.quality_stats.total_inspections} | {t('analytics.open_issues')}: {data.quality_stats.open_issues}
                </div>
              </Card>
            </Col>
          )}
          {config.analytics.approval_stats && (
            <Col span={8}>
              <Card title={t('analytics.approval_overview')}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={approvalData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                      {approvalData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
