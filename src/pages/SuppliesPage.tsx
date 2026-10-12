import React, { useState, useEffect } from 'react';
import { supplyApi, warehouseApi } from '../api/supplyApi';
import { SupplyItem, SupplyTransaction, Warehouse } from '../types/supply';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { exportToCsv } from '../utils/exportCsv';
import { 
  Package, 
  Search, 
  Plus, 
  Download, 
  ArrowRightLeft, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export const SuppliesPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [transactions, setTransactions] = useState<SupplyTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tabs: Current Stock vs. Transaction History
  const [viewTab, setViewTab] = useState<'STOCK' | 'TRANSACTIONS'>('STOCK');

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Adjust stock modal
  const [adjustingItem, setAdjustingItem] = useState<SupplyItem | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Physical Inventory Count');

  // Transfer modal
  const [transferItem, setTransferItem] = useState<SupplyItem | null>(null);
  const [targetWarehouseId, setTargetWarehouseId] = useState<string>('');
  const [transferQty, setTransferQty] = useState<number>(100);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sList, wList, tList] = await Promise.all([
        supplyApi.getSupplies(),
        warehouseApi.getWarehouses(),
        supplyApi.getTransactions(),
      ]);
      setSupplies(sList);
      setWarehouses(wList);
      setTransactions(tList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSupplies = supplies.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(q) || s.sku.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;
    const matchesWh = warehouseFilter === 'ALL' || s.warehouseId === warehouseFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesCategory && matchesWh && matchesStatus;
  });

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem || !user) return;
    await supplyApi.adjustStock(adjustingItem.id, newStockValue, adjustReason, user);
    setAdjustingItem(null);
    loadData();
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferItem || !targetWarehouseId || !user) return;
    await supplyApi.transferStock(transferItem.id, targetWarehouseId, transferQty, user);
    setTransferItem(null);
    loadData();
  };

  const handleExportStockCsv = () => {
    const data = supplies.map(s => ({
      SKU: s.sku,
      Name: s.name,
      Category: s.category,
      Warehouse: s.warehouseName,
      CurrentStock: s.currentStock,
      ReservedStock: s.reservedStock,
      AvailableStock: s.currentStock - s.reservedStock,
      Unit: s.unit,
      Status: s.status,
      ExpiryDate: s.expiryDate || 'N/A',
    }));
    exportToCsv('supplies_inventory_report', data);
  };

  const handleExportTxCsv = () => {
    const data = transactions.map(t => ({
      Timestamp: t.timestamp,
      SKU: t.supplySku,
      Item: t.supplyName,
      Warehouse: t.warehouseName,
      Type: t.type,
      Delta: t.quantityDelta,
      Remaining: t.remainingStock,
      Reason: t.reason,
      User: t.performedByUserName,
    }));
    exportToCsv('supplies_transactions_audit', data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Relief Supply Chain & Warehouse Stock
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            CRITICAL INVENTORY · EXPIRY MONITORING · PALLET AUDIT LEDGER
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={viewTab === 'STOCK' ? handleExportStockCsv : handleExportTxCsv}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Current Stock vs. Transaction History */}
      <div className="flex border-b border-slate-800 text-xs">
        <button
          onClick={() => setViewTab('STOCK')}
          className={`pb-2.5 px-4 font-medium transition-colors flex items-center gap-1.5 ${
            viewTab === 'STOCK'
              ? 'text-white border-b-2 border-rose-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Active Warehouse Stock</span>
        </button>

        <button
          onClick={() => setViewTab('TRANSACTIONS')}
          className={`pb-2.5 px-4 font-medium transition-colors flex items-center gap-1.5 ${
            viewTab === 'TRANSACTIONS'
              ? 'text-white border-b-2 border-cyan-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Inventory Transaction History ({transactions.length})</span>
        </button>
      </div>

      {viewTab === 'STOCK' ? (
        <>
          {/* Filters Bar */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by SKU or item name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="TRAUMA_MEDICAL">Trauma Medical</option>
                <option value="WATER_PURIFICATION">Water Purification</option>
                <option value="FOOD_RATIONS">Food Rations</option>
                <option value="SHELTER_BEDDING">Shelter & Bedding</option>
                <option value="POWER_GENERATION">Power Generation</option>
              </select>

              <select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none"
              >
                <option value="ALL">All Warehouses</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.code}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="CRITICAL">Critical Depleted</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Supplies Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            {isLoading ? (
              <TableSkeleton rows={4} cols={7} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                      <th className="py-3 px-4 font-semibold">SKU & Relief Item</th>
                      <th className="py-3 px-4 font-semibold">Depot Hub</th>
                      <th className="py-3 px-4 font-semibold text-right">Current Stock</th>
                      <th className="py-3 px-4 font-semibold text-right">Reserved</th>
                      <th className="py-3 px-4 font-semibold text-right">Available</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredSupplies.map(item => {
                      const avail = item.currentStock - item.reservedStock;
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{item.name}</div>
                            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                              {item.sku} · Lot: {item.batchNumber}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-300">
                            <div>{item.warehouseName.split('(')[0]}</div>
                            <div className="text-[11px] font-mono text-slate-500">
                              Unit: {item.unitWeightKg}kg / {item.unit}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums">
                            {item.currentStock.toLocaleString()} {item.unit}
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono text-slate-400 tabular-nums">
                            {item.reservedStock.toLocaleString()} {item.unit}
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                            {avail.toLocaleString()} {item.unit}
                          </td>

                          <td className="py-3.5 px-4">
                            <StatusBadge status={item.status} />
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {hasRole(['ADMIN', 'COORDINATOR']) && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setAdjustingItem(item);
                                    setNewStockValue(item.currentStock);
                                    setAdjustReason('Physical Inventory Audit');
                                  }}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
                                >
                                  Adjust
                                </button>
                                <button
                                  onClick={() => {
                                    setTransferItem(item);
                                    const other = warehouses.find(w => w.id !== item.warehouseId);
                                    setTargetWarehouseId(other ? other.id : '');
                                    setTransferQty(Math.min(avail, 200));
                                  }}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
                                >
                                  Transfer
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Transaction History Table */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">SKU & Item</th>
                  <th className="py-3 px-4 font-semibold text-right">Delta Qty</th>
                  <th className="py-3 px-4 font-semibold text-right">Remaining</th>
                  <th className="py-3 px-4 font-semibold">Reason & Authorized User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(t.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.type.includes('OUT') || t.type.includes('RESERVED')
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-sans font-medium">
                      {t.supplyName} ({t.supplySku})
                    </td>
                    <td className={`py-3 px-4 text-right font-bold tabular-nums ${
                      t.quantityDelta < 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {t.quantityDelta > 0 ? `+${t.quantityDelta}` : t.quantityDelta}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                      {t.remainingStock}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] font-sans">
                      <div>{t.reason}</div>
                      <div className="font-mono text-slate-500 text-[10px]">By {t.performedByUserName}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl text-xs space-y-4">
            <h3 className="text-base font-bold text-white">Adjust Physical Inventory Stock</h3>
            <p className="text-slate-400">
              {adjustingItem.name} ({adjustingItem.sku}) at {adjustingItem.warehouseName}
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Verified On-Hand Count ({adjustingItem.unit}):
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStockValue}
                  onChange={(e) => setNewStockValue(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Audit Reason / Justification</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
                >
                  Save Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {transferItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl text-xs space-y-4">
            <h3 className="text-base font-bold text-white">Transfer Stock to Another Warehouse</h3>
            <p className="text-slate-400">
              Transferring {transferItem.name} from {transferItem.warehouseName}
            </p>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Destination Warehouse</label>
                <select
                  value={targetWarehouseId}
                  onChange={(e) => setTargetWarehouseId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                  required
                >
                  {warehouses
                    .filter(w => w.id !== transferItem.warehouseId)
                    .map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Quantity ({transferItem.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  max={transferItem.currentStock - transferItem.reservedStock}
                  required
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTransferItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium transition-colors"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
