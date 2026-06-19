import client from './client';

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  status: string;
  created_at: string;
}

export interface PurchaseRequestItem {
  id: number;
  request_id: number;
  material_id: number;
  quantity: number;
  unit_price: number;
}

export interface PurchaseRequest {
  id: number;
  request_no: string;
  supplier_id: number;
  status: string;
  total_amount: number;
  remarks: string;
  initiator_id: number;
  created_at: string;
  items?: PurchaseRequestItem[];
}

export interface PurchaseOrderItem {
  id: number;
  order_id: number;
  material_id: number;
  quantity: number;
  unit_price: number;
  received_quantity: number;
}

export interface PurchaseOrder {
  id: number;
  order_no: string;
  request_id: number | null;
  supplier_id: number;
  status: string;
  total_amount: number;
  delivery_date: string;
  remarks: string;
  created_at: string;
  items?: PurchaseOrderItem[];
}

export const procurementApi = {
  listSuppliers: (params?: { skip?: number; limit?: number }) =>
    client.get<Supplier[]>('/procurement/suppliers', { params }),
  createSupplier: (data: Partial<Supplier>) =>
    client.post<Supplier>('/procurement/suppliers', data),
  updateSupplier: (id: number, data: Partial<Supplier>) =>
    client.put<Supplier>(`/procurement/suppliers/${id}`, data),
  deleteSupplier: (id: number) =>
    client.delete(`/procurement/suppliers/${id}`),

  listRequests: (params?: { skip?: number; limit?: number; status?: string }) =>
    client.get<PurchaseRequest[]>('/procurement/requests', { params }),
  getRequest: (id: number) =>
    client.get<PurchaseRequest & { items: PurchaseRequestItem[] }>(`/procurement/requests/${id}`),
  createRequest: (data: { supplier_id: number; remarks?: string; items: { material_id: number; quantity: number; unit_price: number }[] }) =>
    client.post<PurchaseRequest>('/procurement/requests', data),
  submitRequest: (id: number) =>
    client.post<PurchaseRequest>(`/procurement/requests/${id}/submit-approval`),

  listOrders: (params?: { skip?: number; limit?: number; status?: string }) =>
    client.get<PurchaseOrder[]>('/procurement/orders', { params }),
  getOrder: (id: number) =>
    client.get<PurchaseOrder & { items: PurchaseOrderItem[] }>(`/procurement/orders/${id}`),
  createOrder: (data: { supplier_id: number; request_id?: number; delivery_date?: string; remarks?: string; items: { material_id: number; quantity: number; unit_price: number }[] }) =>
    client.post<PurchaseOrder>('/procurement/orders', data),
  receiveItems: (orderId: number, items: { item_id: number; quantity: number }[]) =>
    client.post<PurchaseOrder>(`/procurement/orders/${orderId}/receive`, items),
};
