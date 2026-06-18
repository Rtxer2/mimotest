import { Card, Col, Row, Statistic } from 'antd';
import {
  FileTextOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { productionApi, ProductionDashboard as DashboardData } from '../../api/production';

const ProductionDashboard = () => {
  const [stats, setStats] = useState<DashboardData>({
    total_orders: 0,
    in_progress: 0,
    completed: 0,
    delayed: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await productionApi.dashboard();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to load production stats:', error);
      }
    };
    loadStats();
  }, []);

  return (
    <div>
      <h2>Production Dashboard</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Orders" value={stats.total_orders} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="In Progress" value={stats.in_progress} prefix={<SyncOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Completed" value={stats.completed} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Delayed" value={stats.delayed} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductionDashboard;
