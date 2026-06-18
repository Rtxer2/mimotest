import client from './client';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  content: string;
  type: string;
  is_read: boolean;
  link: string;
  created_at: string;
}

export interface NotificationRule {
  id: number;
  event_type: string;
  role: string | null;
  user_id: number | null;
  is_active: boolean;
}

export const notificationApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    client.get<Notification[]>('/notifications', { params }),

  getUnreadCount: () =>
    client.get<{ count: number }>('/notifications/unread-count'),

  markAsRead: (id: number) =>
    client.put(`/notifications/${id}/read`),

  markAllAsRead: () =>
    client.put('/notifications/read-all'),

  listRules: (params?: { skip?: number; limit?: number }) =>
    client.get<NotificationRule[]>('/notifications/rules', { params }),

  createRule: (data: { event_type: string; role?: string; user_id?: number }) =>
    client.post<NotificationRule>('/notifications/rules', data),

  updateRule: (id: number, data: { event_type?: string; role?: string; user_id?: number; is_active?: boolean }) =>
    client.put<NotificationRule>(`/notifications/rules/${id}`, data),

  deleteRule: (id: number) =>
    client.delete(`/notifications/rules/${id}`),
};
