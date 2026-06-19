import client from './client';

export interface Supplier {
  id: number;
  code: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  status: string;
  created_at: string;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  created_at: string;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  location: string;
  created_at: string;
}

export interface PurchaseRequestItem {
  id: number;
  request_id: number;
  item_type: string;
  material_id: number | null;
  product_id: number | null;
  quantity: number;
  unit_price: number;
}

export interface PurchaseRequest {
  id: number;
  request_no: string;
  supplier_id: number;
  supplier_name: string;
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
  item_type: string;
  material_id: number | null;
  product_id: number | null;
  quantity: number;
  unit_price: number;
  received_quantity: number;
}

export interface PurchaseReturn {
  id: number;
  return_no: string;
  order_id: number;
  supplier_id: number;
  status: string;
  reason: string;
  created_at: string;
  items?: PurchaseReturnItem[];
}

export interface PurchaseReturnItem {
  id: number;
  return_id: number;
  order_item_id: number;
  quantity: number;
  reason: string;
}

export interface PurchaseOrder {
  id: number;
  order_no: string;
  request_id: number | null;
  supplier_id: number;
  supplier_name: string;
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

  searchSuppliers: (q: string) =>
    client.get<Supplier[]>('/procurement/suppliers/search', { params: { q } }),

  listRequests: (params?: { skip?: number; limit?: number; status?: string }) =>
    client.get<PurchaseRequest[]>('/procurement/requests', { params }),
  getRequest: (id: number) =>
    client.get<PurchaseRequest & { items: PurchaseRequestItem[] }>(`/procurement/requests/${id}`),
  createRequest: (data: { supplier_id: number; remarks?: string; items: { item_type: string; material_id?: number; product_id?: number; quantity: number; unit_price: number }[] }) =>
    client.post<PurchaseRequest>('/procurement/requests', data),
  submitRequest: (id: number) =>
    client.post<PurchaseRequest>(`/procurement/requests/${id}/submit`),
  deleteRequest: (id: number) =>
    client.delete(`/procurement/requests/${id}`),

  listOrders: (params?: { skip?: number; limit?: number; status?: string }) =>
    client.get<PurchaseOrder[]>('/procurement/orders', { params }),
  getOrder: (id: number) =>
    client.get<PurchaseOrder & { items: PurchaseOrderItem[] }>(`/procurement/orders/${id}`),
  createOrder: (data: { supplier_id: number; request_id?: number; delivery_date?: string; remarks?: string; items: { item_type: string; material_id?: number; product_id?: number; quantity: number; unit_price: number }[] }) =>
    client.post<PurchaseOrder>('/procurement/orders', data),
  receiveItems: (orderId: number, items: { item_id: number; pass_quantity: number; reject_quantity: number }[]) =>
    client.post<PurchaseOrder>(`/procurement/orders/${orderId}/receive`, items),
  updateOrder: (id: number, data: { supplier_id: number; request_id?: number; delivery_date?: string; remarks?: string; items: { item_type: string; material_id?: number; product_id?: number; quantity: number; unit_price: number }[] }) =>
    client.put<PurchaseOrder>(`/procurement/orders/${id}`, data),
  completeOrder: (id: number) =>
    client.post<PurchaseOrder>(`/procurement/orders/${id}/complete`),

  listReturns: (params?: { skip?: number; limit?: number; order_id?: number }) =>
    client.get<PurchaseReturn[]>('/procurement/returns', { params }),
  getReturn: (id: number) =>
    client.get<PurchaseReturn & { items: PurchaseReturnItem[] }>(`/procurement/returns/${id}`),
  createReturn: (data: { order_id: number; supplier_id: number; reason?: string; items: { order_item_id: number; quantity: number; reason?: string }[] }) =>
    client.post<PurchaseReturn>('/procurement/returns', data),
  completeReturn: (id: number) =>
    client.post<PurchaseReturn>(`/procurement/returns/${id}/complete`),

  searchDepartments: (q: string) =>
    client.get<Department[]>('/procurement/departments/search', { params: { q } }),
  createDepartment: (data: Partial<Department>) =>
    client.post<Department>('/procurement/departments', data),

  searchWarehouses: (q: string) =>
    client.get<Warehouse[]>('/procurement/warehouses/search', { params: { q } }),
  createWarehouse: (data: Partial<Warehouse>) =>
    client.post<Warehouse>('/procurement/warehouses', data),
};
