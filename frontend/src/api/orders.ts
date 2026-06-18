import client from './client';

export interface OrderItem {
  id: number;
  order_id: number;
  product_name: string;
  quantity: number;
  unit_price?: number;
  specs?: string;
}

export interface Order {
  id: number;
  order_no: string;
  customer_id: number;
  status: string;
  total_amount?: number;
  delivery_date?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderCreate {
  customer_id: number;
  delivery_date?: string;
  remarks?: string;
  items: {
    product_name: string;
    quantity: number;
    unit_price?: number;
    specs?: string;
  }[];
}

export const orderApi = {
  list: (params?: { skip?: number; limit?: number; customer_id?: number; status?: string }) =>
    client.get<Order[]>('/orders', { params }),

  get: (id: number) =>
    client.get<Order & { items: OrderItem[] }>(`/orders/${id}`),

  create: (data: OrderCreate) =>
    client.post<Order>('/orders', data),

  update: (id: number, data: Partial<Order>) =>
    client.put<Order>(`/orders/${id}`, data),

  updateStatus: (id: number, status: string) =>
    client.put<Order>(`/orders/${id}/status`, null, { params: { status } }),
};
