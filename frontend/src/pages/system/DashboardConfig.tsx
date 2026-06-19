import { useEffect, useState } from 'react';
import { Card, Switch, Button, message, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { preferenceApi, DashboardConfig, DEFAULT_CONFIG } from '../../api/preferences';

const DashboardConfigPage = () => {
  const { t } = useTranslation();
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
      message.success(t('system.config_saved'));
    } catch {
      message.error(t('system.config_save_failed'));
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
        <h2>{t('system.dashboard_config_title')}</h2>
        <Button type="primary" loading={saving} onClick={handleSave}>{t('common.save')}</Button>
      </div>

      <Card title={t('system.dashboard_section')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('system.total_customers')}</span>
            <Switch checked={config.dashboard.customers} onChange={(v) => updateDashboard('customers', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('system.total_orders')}</span>
            <Switch checked={config.dashboard.orders} onChange={(v) => updateDashboard('orders', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('system.production_orders')}</span>
            <Switch checked={config.dashboard.production} onChange={(v) => updateDashboard('production', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('system.quality_stats')}</span>
            <Switch checked={config.dashboard.quality} onChange={(v) => updateDashboard('quality', v)} />
          </div>
        </div>
      </Card>

      <Card title={t('system.analytics_section')} style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('system.metrics_cards')}</span>
            <Switch checked={config.analytics.metrics} onChange={(v) => updateAnalytics('metrics', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('system.order_trend_chart')}</span>
            <Switch checked={config.analytics.order_trend} onChange={(v) => updateAnalytics('order_trend', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('system.order_status_distribution')}</span>
            <Switch checked={config.analytics.order_status} onChange={(v) => updateAnalytics('order_status', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('system.production_order_stats')}</span>
            <Switch checked={config.analytics.production_stats} onChange={(v) => updateAnalytics('production_stats', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('system.inventory_overview')}</span>
            <Switch checked={config.analytics.inventory_stats} onChange={(v) => updateAnalytics('inventory_stats', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('system.quality_stats')}</span>
            <Switch checked={config.analytics.quality_stats} onChange={(v) => updateAnalytics('quality_stats', v)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('system.approval_overview')}</span>
            <Switch checked={config.analytics.approval_stats} onChange={(v) => updateAnalytics('approval_stats', v)} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardConfigPage;
