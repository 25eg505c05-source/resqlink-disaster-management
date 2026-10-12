export type SupplyCategory = 
  | 'WATER_PURIFICATION' 
  | 'FOOD_RATIONS' 
  | 'TRAUMA_MEDICAL' 
  | 'SHELTER_BEDDING' 
  | 'POWER_GENERATION' 
  | 'SEARCH_EQUIPMENT';

export type SupplyStatus = 'IN_STOCK' | 'LOW_STOCK' | 'CRITICAL' | 'OUT_OF_STOCK';

export interface SupplyItem {
  id: string;
  sku: string;
  name: string;
  category: SupplyCategory;
  warehouseId: string;
  warehouseName: string;
  currentStock: number;
  reservedStock: number;
  minimumThreshold: number;
  unit: string;
  unitWeightKg: number;
  batchNumber: string;
  expiryDate?: string;
  status: SupplyStatus;
  lastUpdated: string;
}

export type TransactionType = 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'DISPATCH_RESERVED' | 'DISPATCH_CONSUMED' | 'RESTOCK';

export interface SupplyTransaction {
  id: string;
  supplyId: string;
  supplySku: string;
  supplyName: string;
  warehouseId: string;
  warehouseName: string;
  type: TransactionType;
  quantityDelta: number;
  remainingStock: number;
  reason: string;
  performedByUserId: string;
  performedByUserName: string;
  timestamp: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: 'CENTRAL_DEPOT' | 'FORWARD_STAGING_HUB' | 'AIRSTRIP_DISTRIBUTION';
  lat: number;
  lng: number;
  capacityTonnes: number;
  utilizationPercent: number;
  usedTonnes: number;
  contactOfficer: string;
  phone: string;
  address: string;
  supplyCount: number;
  criticalStockCount: number;
}
