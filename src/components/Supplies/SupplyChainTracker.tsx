import React, { useState } from 'react';
import { SupplyItem, Warehouse, SupplyCategory } from '../../types/disaster';
import { 
  Package, 
  Search, 
  Plus, 
  ArrowRightLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Truck,
  Layers,
  ArrowUpDown
} from 'lucide-react';

const WAREHOUSE_IMG = '/src/assets/images/warehouse_depot_relief_1791462603108.jpg';

interface SupplyChainTrackerProps {
  supplies: SupplyItem[];
  warehouses: Warehouse[];
  onUpdateStock: (id: string, newStock: number) => void;
  onTransferSupply: (supplyId: string, targetWarehouseId: string, quantity: number) => void;
  onOpenNewDispatch: (incidentId?: string) => void;
}

export default function SupplyChainTracker({
  supplies,
  warehouses,
  onUpdateStock,
  onTransferSupply,
  onOpenNewDispatch,
}: SupplyChainTrackerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LOW' | 'IN_STOCK'>('ALL');

  // Stock edit modal state
  const [editingItem, setEditingItem] = useState<SupplyItem | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  // Transfer modal state
  const [transferringItem, setTransferringItem] = useState<SupplyItem | null>(null);
  const [targetWarehouseId, setTargetWarehouseId] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(100);

  // Filter supplies
  const filteredSupplies = supplies.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesWarehouse = selectedWarehouse === 'ALL' || item.warehouseId === selectedWarehouse;
    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'LOW' ? (item.status === 'LOW_STOCK' || item.status === 'CRITICAL_DEPLETED') :
      item.status === 'IN_STOCK';
    return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus;
  });

  const lowStockCount = supplies.filter(s => s.status === 'LOW_STOCK' || s.status === 'CRITICAL_DEPLETED').length;
  const totalTonnage = Math.round(supplies.reduce((acc, s) => acc + (s.currentStock * s.unitWeightKg) / 1000, 0));

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onUpdateStock(editingItem.id, editQuantity);
    setEditingItem(null);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringItem || !targetWarehouseId) return;
    onTransferSupply(transferringItem.id, targetWarehouseId, transferAmount);
    setTransferringItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img 
            src={WAREHOUSE_IMG} 
            alt="Disaster Logistics Depot" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative p-6 z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
              <span>UN-OCHA & FEMA SPEC LOGISTICS</span>
              <span aria-hidden="true">·</span>
              <span>3 STAGING DEPOTS ACTIVE</span>
              <span aria-hidden="true">·</span>
              <span>CONTINUOUS INVENTORY AUDIT</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Relief Supply Chain & Warehouse Depots
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Real-time pallet accounting for medical trauma packs, potable water rations, thermal shelter kits, and high-capacity electrical generation equipment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenNewDispatch()}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <Truck className="w-4 h-4" />
              <span>Launch Supply Convoy</span>
            </button>
          </div>
        </div>

        {/* Tactical Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-800/80 bg-slate-950/70 text-xs">
          <div className="p-4 border-r border-slate-800/80">
            <span className="text-slate-500 block text-[11px]">Total Stocked Tonnage</span>
            <span className="text-lg font-bold font-mono text-white tabular-nums">{totalTonnage.toLocaleString()} t</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Across 3 regional hubs</span>
          </div>

          <div className="p-4 border-r border-slate-800/80">
            <span className="text-slate-500 block text-[11px]">Unique Relief SKUs</span>
            <span className="text-lg font-bold font-mono text-cyan-400 tabular-nums">{supplies.length}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Categorized & barcoded</span>
          </div>

          <div className="p-4 border-r border-slate-800/80">
            <span className="text-slate-500 block text-[11px]">Low Stock Threshold Alerts</span>
            <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">{lowStockCount} Items</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Replenishment queued</span>
          </div>

          <div className="p-4">
            <span className="text-slate-500 block text-[11px]">Logistics Network Status</span>
            <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">OPERATIONAL</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Zero port blockages</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search supplies by name or SKU (e.g. MED-TRM, Water)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 font-mono"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="TRAUMA_MEDICAL">Trauma Medical</option>
            <option value="WATER_PURIFICATION">Water Purification</option>
            <option value="FOOD_RATIONS">Food Rations</option>
            <option value="SHELTER_BEDDING">Shelter & Bedding</option>
            <option value="POWER_GENERATION">Power Generation</option>
            <option value="SEARCH_EQUIPMENT">Search & Rescue Equip</option>
          </select>

          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-slate-700"
          >
            <option value="ALL">All Depots</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.code} - {w.name.split('(')[0]}</option>
            ))}
          </select>
        </div>

        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'ALL' 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Stock
          </button>
          <button
            onClick={() => setStatusFilter('LOW')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'LOW' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Low / Critical ({lowStockCount})
          </button>
          <button
            onClick={() => setStatusFilter('IN_STOCK')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'IN_STOCK' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nominal Stock
          </button>
        </div>
      </div>

      {/* Supplies Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-3 px-4 font-semibold">SKU & Item Name</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Warehouse Depot</th>
                <th className="py-3 px-4 font-semibold text-right">Available Stock</th>
                <th className="py-3 px-4 font-semibold text-right">Reserved Stock</th>
                <th className="py-3 px-4 font-semibold text-right">Min Threshold</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredSupplies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No relief supplies matching filter parameters.
                  </td>
                </tr>
              ) : (
                filteredSupplies.map((item) => {
                  const isLow = item.status === 'LOW_STOCK';
                  const isCritical = item.status === 'CRITICAL_DEPLETED';

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {item.sku} · Lot: {item.batchNumber}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-300">
                        {item.category.replace(/_/g, ' ')}
                      </td>

                      {/* Warehouse */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-medium text-slate-200">{item.warehouseName.split('(')[0]}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          Unit: {item.unitWeightKg} kg / {item.unit}
                        </div>
                      </td>

                      {/* Available Stock */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-white tabular-nums text-sm">
                          {item.currentStock.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-400 block">{item.unit}</span>
                      </td>

                      {/* Reserved */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400 tabular-nums">
                        {item.reservedStock.toLocaleString()} {item.unit}
                      </td>

                      {/* Threshold */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400 tabular-nums">
                        {item.minimumThreshold.toLocaleString()} {item.unit}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold ${
                          isCritical ? 'text-rose-400' :
                          isLow ? 'text-amber-400' :
                          'text-emerald-400'
                        }`}>
                          {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                          {isLow && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                          {!isCritical && !isLow && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          <span>{item.status.replace(/_/g, ' ')}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setEditQuantity(item.currentStock);
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                            title="Adjust Stock Level"
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => {
                              setTransferringItem(item);
                              const otherWh = warehouses.find(w => w.id !== item.warehouseId);
                              setTargetWarehouseId(otherWh ? otherWh.id : '');
                              setTransferAmount(Math.min(item.currentStock, 200));
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                            title="Transfer Stock to Another Depot"
                          >
                            Transfer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-white mb-1">
              Adjust Physical Stock Count
            </h3>
            <p className="text-slate-400 mb-4">
              {editingItem.name} ({editingItem.sku})
            </p>

            <form onSubmit={handleSaveStock} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Verified On-Hand Quantity ({editingItem.unit}):
                </label>
                <input
                  type="number"
                  min="0"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Current logged count: {editingItem.currentStock.toLocaleString()} {editingItem.unit}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
                >
                  Update Inventory Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Stock Modal */}
      {transferringItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-white mb-1">
              Inter-Warehouse Logistics Transfer
            </h3>
            <p className="text-slate-400 mb-4">
              Transfer {transferringItem.name} from {transferringItem.warehouseName}
            </p>

            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Destination Warehouse Depot:
                </label>
                <select
                  value={targetWarehouseId}
                  onChange={(e) => setTargetWarehouseId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                  required
                >
                  {warehouses
                    .filter(w => w.id !== transferringItem.warehouseId)
                    .map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Transfer Quantity ({transferringItem.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  max={transferringItem.currentStock}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Available in source warehouse: {transferringItem.currentStock.toLocaleString()} {transferringItem.unit}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferringItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium transition-colors"
                >
                  Dispatch Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
