import React, { useState, useEffect } from 'react';
import { warehouseApi, supplyApi } from '../api/supplyApi';
import { Warehouse, SupplyItem } from '../types/supply';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { Warehouse as WarehouseIcon, MapPin, Phone, User, Package, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WarehousesPage: React.FC = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([warehouseApi.getWarehouses(), supplyApi.getSupplies()])
      .then(([wList, sList]) => {
        setWarehouses(wList);
        setSupplies(sList);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <CardSkeleton count={3} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Logistics Warehouses & Staging Depots
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            STRATEGIC RELIEF DEPOTS · CAPACITY AUDIT · INVENTORY UTILIZATION
          </p>
        </div>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {warehouses.map(wh => {
          const whSupplies = supplies.filter(s => s.warehouseId === wh.id);
          const criticalCount = whSupplies.filter(s => s.status === 'CRITICAL' || s.status === 'LOW_STOCK').length;

          return (
            <div key={wh.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between shadow-lg space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
                      <WarehouseIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono text-[11px] text-cyan-400 font-bold">{wh.code}</span>
                      <h3 className="font-semibold text-white text-sm">{wh.name}</h3>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{wh.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Officer: {wh.contactOfficer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{wh.phone}</span>
                  </div>
                </div>

                {/* Utilization Progress Bar */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Capacity Utilization:</span>
                    <span className="font-mono font-bold text-sky-400">{wh.utilizationPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        wh.utilizationPercent > 80 ? 'bg-amber-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${wh.utilizationPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-500">
                    <span>Used: {wh.usedTonnes} tonnes</span>
                    <span>Max: {wh.capacityTonnes} tonnes</span>
                  </div>
                </div>

                {/* Stock Stats */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Relief SKUs:</span>
                    <span className="text-white font-bold">{whSupplies.length}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Low/Critical:</span>
                    <span className={`font-bold ${criticalCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {criticalCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[11px] font-mono text-slate-500">
                  {wh.lat.toFixed(2)}°N {wh.lng.toFixed(2)}°W
                </span>
                <button
                  onClick={() => navigate('/supplies')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs flex items-center gap-1"
                >
                  <span>Inventory List</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
