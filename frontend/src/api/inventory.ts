import client from './client';

export interface Material {
  id: number;
  name: string;
  code: string;
  unit: string;
  safety_stock: number;
  current_stock: number;
}

export interface FinishedProduct {
  id: number;
  product_name: string;
  sku: string;
  current_stock: number;
  safety_stock: number;
  category: string | null;
  photos: string | null;
}

export interface Category {
  id: number;
  name: string;
}

export interface StockTransaction {
  id: number;
  item_type: string;
  item_id: number;
  transaction_type: string;
  quantity: number;
  reason?: string;
  transaction_date: string;
}

export const inventoryApi = {
  listMaterials: (params?: { skip?: number; limit?: number }) =>
    client.get<Material[]>('/inventory/materials', { params }),

  createMaterial: (data: Omit<Material, 'id' | 'current_stock'>) =>
    client.post<Material>('/inventory/materials', data),

  listProducts: (params?: { skip?: number; limit?: number; category?: string }) =>
    client.get<FinishedProduct[]>('/inventory/products', { params }),

  createProduct: (data: { product_name: string; sku: string; safety_stock: number; category?: string }) =>
    client.post<FinishedProduct>('/inventory/products', data),

  updateProduct: (id: number, data: { product_name?: string; sku?: string; safety_stock?: number; category?: string }) =>
    client.put<FinishedProduct>(`/inventory/products/${id}`, data),

  deleteProduct: (id: number) =>
    client.delete(`/inventory/products/${id}`),

  listCategories: () =>
    client.get<Category[]>('/inventory/products/categories'),

  createCategory: (name: string) =>
    client.post<Category>('/inventory/products/categories', { name }),

  deleteCategory: (id: number) =>
    client.delete(`/inventory/products/categories/${id}`),

  uploadProductPhoto: (productId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post<{ photo_url: string; photos: string }>(
      `/inventory/products/${productId}/photos`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  removeProductPhoto: (productId: number, photoUrl: string) =>
    client.delete<{ photos: string }>(`/inventory/products/${productId}/photos`, { params: { photo_url: photoUrl } }),

  createTransaction: (data: {
    item_type: string;
    item_id: number;
    transaction_type: string;
    quantity: number;
    reason?: string;
  }) =>
    client.post<StockTransaction>('/inventory/transactions', data),

  listTransactions: (params?: { item_type?: string; item_id?: number; skip?: number; limit?: number }) =>
    client.get<StockTransaction[]>('/inventory/transactions', { params }),

  getAlerts: () =>
    client.get<{ materials: Material[]; products: FinishedProduct[] }>('/inventory/alerts'),

  searchMaterials: (q: string) =>
    client.get<Material[]>('/inventory/materials/search', { params: { q } }),

  quickCreateMaterial: (name: string, unit: string = 'pcs') =>
    client.post<Material>('/inventory/materials/quick-create', null, { params: { name, unit } }),

  searchProducts: (q: string) =>
    client.get<FinishedProduct[]>('/inventory/products/search', { params: { q } }),

  quickCreateProduct: (name: string) =>
    client.post<FinishedProduct>('/inventory/products/quick-create', null, { params: { name } }),
};
