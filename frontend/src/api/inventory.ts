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

  listProducts: (params?: { skip?: number; limit?: number }) =>
    client.get<FinishedProduct[]>('/inventory/products', { params }),

  createProduct: (data: Omit<FinishedProduct, 'id' | 'current_stock'>) =>
    client.post<FinishedProduct>('/inventory/products', data),

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
};
