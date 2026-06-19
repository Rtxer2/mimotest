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

const STATUS_LABELS: Record<string, string> = {
  pending: '待处理',
  pending_approval: '待审批',
  confirmed: '已确认',
  production: '生产中',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
  approved: '已通过',
  rejected: '已驳回',
};

const PIE_COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2'];

const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

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
    { name: '通过', value: data.quality_stats.passed },
    { name: '未通过', value: data.quality_stats.failed },
  ];

  const approvalData = [
    { name: '待审批', value: data.approval_stats.pending },
    { name: '已通过', value: data.approval_stats.approved },
    { name: '已驳回', value: data.approval_stats.rejected },
    { name: '已取消', value: data.approval_stats.cancelled },
  ].filter((item) => item.value > 0);

  const hasTrendRow = config.analytics.order_trend || config.analytics.order_status;
  const hasBottomRow = config.analytics.production_stats || config.analytics.quality_stats || config.analytics.approval_stats;

  return (
    <div>
      <h2>数据大屏</h2>

      {config.analytics.metrics && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}>
            <Card>
              <Statistic title="客户总数" value={data.metrics.total_customers} prefix={<UserOutlined />} />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title="订单总数" value={data.metrics.total_orders} prefix={<ShoppingCartOutlined />} />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title="订单总额" value={data.metrics.total_order_amount} prefix="¥" precision={2} />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title="生产中工单" value={data.metrics.active_production_orders} prefix={<ToolOutlined />} />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title="库存预警" value={data.metrics.low_stock_materials} prefix={<InboxOutlined />} valueStyle={{ color: data.metrics.low_stock_materials > 0 ? '#ff4d4f' : undefined }} />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic title="待审批" value={data.metrics.pending_approvals} prefix={<AuditOutlined />} valueStyle={{ color: data.metrics.pending_approvals > 0 ? '#faad14' : undefined }} />
            </Card>
          </Col>
        </Row>
      )}

      {hasTrendRow && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          {config.analytics.order_trend && (
            <Col span={config.analytics.order_status ? 16 : 24}>
              <Card title="订单趋势">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.order_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="count" name="订单数" stroke="#1890ff" />
                    <Line yAxisId="right" type="monotone" dataKey="amount" name="金额" stroke="#52c41a" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}
          {config.analytics.order_status && (
            <Col span={config.analytics.order_trend ? 8 : 24}>
              <Card title="订单状态分布">
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
              <Card title="生产工单统计">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={productionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="数量" fill="#1890ff" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}
          {config.analytics.quality_stats && (
            <Col span={8}>
              <Card title="质量检验">
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
                  检验总数: {data.quality_stats.total_inspections} | 未关闭问题: {data.quality_stats.open_issues}
                </div>
              </Card>
            </Col>
          )}
          {config.analytics.approval_stats && (
            <Col span={8}>
              <Card title="审批概览">
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
