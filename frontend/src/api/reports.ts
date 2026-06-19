import client from './client';

export const reportApi = {
  export: (type: string, format: string) =>
    client.get(`/reports/export`, {
      params: { type, format },
      responseType: 'blob',
    }),

  exportOrder: (orderId: number, format: string) =>
    client.get(`/reports/orders/${orderId}`, {
      params: { format },
      responseType: 'blob',
    }),
};
