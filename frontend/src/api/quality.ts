import client from './client';

export interface QualityInspection {
  id: number;
  inspection_type: string;
  item_id: number;
  result: string;
  inspector?: string;
  inspect_time?: string;
  remarks?: string;
  created_at: string;
}

export interface QualityIssue {
  id: number;
  inspection_id: number;
  issue_type: string;
  description?: string;
  status: string;
}

export const qualityApi = {
  listInspections: (params?: { skip?: number; limit?: number; inspection_type?: string }) =>
    client.get<QualityInspection[]>('/quality/inspections', { params }),

  getInspection: (id: number) =>
    client.get<QualityInspection & { issues: QualityIssue[] }>(`/quality/inspections/${id}`),

  createInspection: (data: Omit<QualityInspection, 'id' | 'created_at'> & { issues?: { issue_type: string; description?: string }[] }) =>
    client.post<QualityInspection>('/quality/inspections', data),

  listIssues: (params?: { skip?: number; limit?: number; status?: string }) =>
    client.get<QualityIssue[]>('/quality/issues', { params }),

  updateIssue: (id: number, status: string) =>
    client.put<QualityIssue>(`/quality/issues/${id}`, { status }),
};
