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

const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    orders: 0,
    production: 0,
    quality: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [customers, orders, production] = await Promise.all([
          customerApi.list({ limit: 1 }),
          orderApi.list({ limit: 1 }),
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
    loadStats();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Customers" value={stats.customers} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Orders" value={stats.orders} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Production" value={stats.production} prefix={<ToolOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Quality" value={stats.quality} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
