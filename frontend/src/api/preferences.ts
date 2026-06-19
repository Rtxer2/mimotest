import client from './client';

export interface DashboardConfig {
  dashboard: {
    customers: boolean;
    orders: boolean;
    production: boolean;
    quality: boolean;
  };
  analytics: {
    metrics: boolean;
    order_trend: boolean;
    order_status: boolean;
    production_stats: boolean;
    inventory_stats: boolean;
    quality_stats: boolean;
    approval_stats: boolean;
  };
}

export const DEFAULT_CONFIG: DashboardConfig = {
  dashboard: {
    customers: true,
    orders: true,
    production: true,
    quality: true,
  },
  analytics: {
    metrics: true,
    order_trend: true,
    order_status: true,
    production_stats: true,
    inventory_stats: true,
    quality_stats: true,
    approval_stats: true,
  },
};

export const preferenceApi = {
  get: () => client.get<DashboardConfig>('/preferences/me'),
  save: (config: DashboardConfig) => client.put<DashboardConfig>('/preferences/me', config),
};
