import client from './client';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  is_active?: boolean;
}

export const userApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    client.get<User[]>('/users', { params }),
  get: (id: number) =>
    client.get<User>(`/users/${id}`),
  create: (data: UserCreate) =>
    client.post<User>('/users', data),
  update: (id: number, data: UserUpdate) =>
    client.put<User>(`/users/${id}`, data),
  delete: (id: number) =>
    client.delete(`/users/${id}`),
};
