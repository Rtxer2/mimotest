import client from './client';

export interface DictType {
  id: number;
  name: string;
  code: string;
  description: string;
  status: string;
}

export interface DictEntry {
  id: number;
  dict_type_code: string;
  label: string;
  value: string;
  sort_order: number;
  status: string;
  remark: string;
}

export const dictApi = {
  listTypes: (params?: { skip?: number; limit?: number }) =>
    client.get<DictType[]>('/dict/types', { params }),

  getType: (id: number) =>
    client.get<DictType>(`/dict/types/${id}`),

  createType: (data: { name: string; code: string; description?: string }) =>
    client.post<DictType>('/dict/types', data),

  updateType: (id: number, data: { name?: string; description?: string; status?: string }) =>
    client.put<DictType>(`/dict/types/${id}`, data),

  deleteType: (id: number) =>
    client.delete(`/dict/types/${id}`),

  listEntries: (params?: { dict_type_code?: string; skip?: number; limit?: number }) =>
    client.get<DictEntry[]>('/dict/entries', { params }),

  getEntry: (id: number) =>
    client.get<DictEntry>(`/dict/entries/${id}`),

  createEntry: (data: { dict_type_code: string; label: string; value: string; sort_order?: number; remark?: string }) =>
    client.post<DictEntry>('/dict/entries', data),

  updateEntry: (id: number, data: { label?: string; value?: string; sort_order?: number; status?: string; remark?: string }) =>
    client.put<DictEntry>(`/dict/entries/${id}`, data),

  deleteEntry: (id: number) =>
    client.delete(`/dict/entries/${id}`),
};
