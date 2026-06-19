import { useEffect, useState } from 'react';
import { Card, Switch, Button, message, Spin } from 'antd';
import { preferenceApi, DashboardConfig, DEFAULT_CONFIG } from '../../api/preferences';

const DashboardConfigPage = () => {
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await preferenceApi.get();
        setConfig(res.data);
      } catch {
        setConfig(DEFAULT_CONFIG);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await preferenceApi.save(config);
      message.success('配置已保存');
    } catch {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const updateDashboard = (key: keyof DashboardConfig['dashboard'], value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      dashboard: { ...prev.dashboard, [key]: value },
    }));
  };

  const updateAnalytics = (key: keyof DashboardConfig['analytics'], value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      analytics: { ...prev.analytics, [key]: value },
    }));
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>仪表盘配置</h2>
        <Button type="primary" loading={saving} onClick={handleSave}>保存</Button>
      </div>

      <Card title="首页 Dashboard">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>客户总数</span>
            <Switch checked={config.dashboard.customers} onChange={(v) => updateDashboard('customers', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>订单总数</span>
            <Switch checked={config.dashboard.orders} onChange={(v) => updateDashboard('orders', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>生产工单</span>
            <Switch checked={config.dashboard.production} onChange={(v) => updateDashboard('production', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>质量统计</span>
            <Switch checked={config.dashboard.quality} onChange={(v) => updateDashboard('quality', v)} />
          </div>
        </div>
      </Card>

      <Card title="数据大屏" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>核心指标卡片</span>
            <Switch checked={config.analytics.metrics} onChange={(v) => updateAnalytics('metrics', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>订单趋势图</span>
            <Switch checked={config.analytics.order_trend} onChange={(v) => updateAnalytics('order_trend', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>订单状态分布</span>
            <Switch checked={config.analytics.order_status} onChange={(v) => updateAnalytics('order_status', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>生产工单统计</span>
            <Switch checked={config.analytics.production_stats} onChange={(v) => updateAnalytics('production_stats', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>库存概览</span>
            <Switch checked={config.analytics.inventory_stats} onChange={(v) => updateAnalytics('inventory_stats', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>质量统计</span>
            <Switch checked={config.analytics.quality_stats} onChange={(v) => updateAnalytics('quality_stats', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>审批概览</span>
            <Switch checked={config.analytics.approval_stats} onChange={(v) => updateAnalytics('approval_stats', v)} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardConfigPage;
