import { apiClient } from './client';
import { SupplyItem, SupplyTransaction, Warehouse } from '../types/supply';
import { User } from '../types/auth';
import { dataStore } from '../services/dataStore';

export const supplyApi = {
  async getSupplies(): Promise<SupplyItem[]> {
    try {
      const response = await apiClient.get<SupplyItem[]>('/supplies');
      return response.data;
    } catch {
      return dataStore.getSupplies();
    }
  },

  async adjustStock(supplyId: string, newStock: number, reason: string, user: User): Promise<SupplyItem> {
    try {
      const response = await apiClient.put<SupplyItem>(`/supplies/${supplyId}/adjust`, {
        newStock,
        reason,
      });
      return response.data;
    } catch {
      return dataStore.adjustStock(supplyId, newStock, reason, user);
    }
  },

  async transferStock(supplyId: string, targetWarehouseId: string, quantity: number, user: User): Promise<void> {
    try {
      await apiClient.post('/supplies/transfer', {
        supplyId,
        targetWarehouseId,
        quantity,
      });
    } catch {
      await dataStore.transferStock(supplyId, targetWarehouseId, quantity, user);
    }
  },

  async getTransactions(): Promise<SupplyTransaction[]> {
    try {
      const response = await apiClient.get<SupplyTransaction[]>('/supplies/transactions');
      return response.data;
    } catch {
      return dataStore.getTransactions();
    }
  },
};

export const warehouseApi = {
  async getWarehouses(): Promise<Warehouse[]> {
    try {
      const response = await apiClient.get<Warehouse[]>('/warehouses');
      return response.data;
    } catch {
      return dataStore.getWarehouses();
    }
  },
};
