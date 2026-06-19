import { Card, Col, Row, Statistic } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { customerApi } from '../api/customers';
import { orderApi } from '../api/orders';
import { productionApi } from '../api/production';
import { preferenceApi, DashboardConfig, DEFAULT_CONFIG } from '../api/preferences';

const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    orders: 0,
    production: 0,
    quality: 0,
  });
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const loadData = async () => {
      try {
        const prefRes = await preferenceApi.get();
        setConfig(prefRes.data);
      } catch {
        setConfig(DEFAULT_CONFIG);
      }

      try {
        const [customers, orders, production] = await Promise.all([
          customerApi.list(),
          orderApi.list(),
          productionApi.dashboard(),
        ]);
        setStats({
          customers: customers.data.length,
          orders: orders.data.length,
          production: production.data.total_orders,
          quality: 0,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    loadData();
  }, []);

  const cards = [];
  if (config.dashboard.customers) {
    cards.push(
      <Col span={6} key="customers">
        <Card>
          <Statistic title="Customers" value={stats.customers} prefix={<UserOutlined />} />
        </Card>
      </Col>
    );
  }
  if (config.dashboard.orders) {
    cards.push(
      <Col span={6} key="orders">
        <Card>
          <Statistic title="Orders" value={stats.orders} prefix={<ShoppingCartOutlined />} />
        </Card>
      </Col>
    );
  }
  if (config.dashboard.production) {
    cards.push(
      <Col span={6} key="production">
        <Card>
          <Statistic title="Production" value={stats.production} prefix={<ToolOutlined />} />
        </Card>
      </Col>
    );
  }
  if (config.dashboard.quality) {
    cards.push(
      <Col span={6} key="quality">
        <Card>
          <Statistic title="Quality" value={stats.quality} prefix={<CheckCircleOutlined />} />
        </Card>
      </Col>
    );
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <Row gutter={16}>
        {cards}
      </Row>
    </div>
  );
};

export default Dashboard;
