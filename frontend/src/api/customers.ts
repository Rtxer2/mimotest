import client from './client';

export interface Customer {
  id: number;
  name: string;
  code: string;
  level: string;
  source?: string;
  country?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  customer_id: number;
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  is_primary: boolean;
}

export interface FollowUp {
  id: number;
  customer_id: number;
  contact_id?: number;
  type: string;
  content: string;
  next_follow_date?: string;
}

export interface CustomerCreate {
  name: string;
  code: string;
  level?: string;
  source?: string;
  country?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const customerApi = {
  list: (params?: { skip?: number; limit?: number; status?: string }) =>
    client.get<Customer[]>('/customers', { params }),

  get: (id: number) =>
    client.get<Customer & { contacts: Contact[]; follow_ups: FollowUp[] }>(`/customers/${id}`),

  create: (data: CustomerCreate) =>
    client.post<Customer>('/customers', data),

  update: (id: number, data: Partial<CustomerCreate>) =>
    client.put<Customer>(`/customers/${id}`, data),

  delete: (id: number) =>
    client.delete(`/customers/${id}`),

  addContact: (customerId: number, data: Omit<Contact, 'id' | 'customer_id'>) =>
    client.post<Contact>(`/customers/${customerId}/contacts`, data),

  addFollowUp: (customerId: number, data: Omit<FollowUp, 'id' | 'customer_id'>) =>
    client.post<FollowUp>(`/customers/${customerId}/follow-ups`, data),
};
