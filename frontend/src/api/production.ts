import client from './client';

export interface ProductionStage {
  id: number;
  production_order_id: number;
  stage_name: string;
  status: string;
  start_time?: string;
  end_time?: string;
  progress: number;
  remarks?: string;
}

export interface ProductionOrder {
  id: number;
  order_id: number;
  status: string;
  assigned_workshop?: string;
  planned_start?: string;
  planned_end?: string;
  remarks?: string;
  created_at: string;
}

export interface ProductionDashboard {
  total_orders: number;
  in_progress: number;
  completed: number;
  delayed: number;
}

export const productionApi = {
  dashboard: () =>
    client.get<ProductionDashboard>('/production/dashboard'),

  listOrders: (params?: { skip?: number; limit?: number; status?: string }) =>
    client.get<ProductionOrder[]>('/production/orders', { params }),

  getOrder: (id: number) =>
    client.get<ProductionOrder & { stages: ProductionStage[] }>(`/production/orders/${id}`),

  createOrder: (data: {
    order_id: number;
    assigned_workshop?: string;
    planned_start?: string;
    planned_end?: string;
    remarks?: string;
    stages: { stage_name: string }[];
  }) =>
    client.post<ProductionOrder>('/production/orders', data),

  updateStage: (orderId: number, stageId: number, status: string, progress?: number) =>
    client.put(`/production/orders/${orderId}/stages/${stageId}`, null, { params: { status, progress } }),
};
