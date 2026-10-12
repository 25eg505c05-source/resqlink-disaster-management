import React, { useState, useEffect } from 'react';
import { dispatchApi } from '../api/dispatchApi';
import { incidentApi } from '../api/incidentApi';
import { warehouseApi, supplyApi } from '../api/supplyApi';
import { volunteerApi } from '../api/volunteerApi';
import { DispatchMission, DispatchStatus } from '../types/dispatch';
import { Incident } from '../types/incident';
import { Warehouse, SupplyItem } from '../types/supply';
import { Volunteer } from '../types/volunteer';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { exportToCsv } from '../utils/exportCsv';
import NewDispatchModal from '../components/Modals/NewDispatchModal';
import { 
  Truck, 
  Search, 
  Plus, 
  Download, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Package, 
  X, 
  Activity,
  Layers,
  FastForward
} from 'lucide-react';

export const DispatchesPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [dispatches, setDispatches] = useState<DispatchMission[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchMission | null>(null);

  // Modal
  const [isNewDispatchOpen, setIsNewDispatchOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dList, incResp, wList, sList, vList] = await Promise.all([
        dispatchApi.getDispatches(),
        incidentApi.getIncidents(),
        warehouseApi.getWarehouses(),
        supplyApi.getSupplies(),
        volunteerApi.getVolunteers(),
      ]);
      setDispatches(dList);
      setIncidents(incResp.items);
      setWarehouses(wList);
      setSupplies(sList);
      setVolunteers(vList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDispatches = dispatches.filter(d => {
    const q = search.toLowerCase();
    const matchesSearch = 
      d.code.toLowerCase().includes(q) ||
      d.incidentTitle.toLowerCase().includes(q) ||
      d.driverOrPilot.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleLaunchDispatch = async (dispatchData: any) => {
    if (!user) return;
    await dispatchApi.createDispatch(dispatchData, user);
    loadData();
  };

  const handleAdvanceTelemetry = async (dId: string, currentProg: number) => {
    const next = Math.min(100, currentProg + 25);
    await dispatchApi.updateDispatchProgress(dId, next);
    loadData();
    if (selectedDispatch && selectedDispatch.id === dId) {
      setSelectedDispatch(prev => prev ? { ...prev, progressPercent: next } : null);
    }
  };

  const handleExportCsv = () => {
    const data = dispatches.map(d => ({
      Code: d.code,
      Incident: d.incidentTitle,
      Origin: d.originWarehouseName,
      Transport: d.transportType,
      Carrier: d.carrierIdentifier,
      Lead: d.driverOrPilot,
      Status: d.status,
      Progress: `${d.progressPercent}%`,
      StartTime: d.startTime,
      ETA: d.estimatedArrival,
    }));
    exportToCsv('relief_dispatches_convoy_log', data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Relief Dispatches & Convoy Logistics
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            GPS CARRIER FLEETS · CARGO MANIFESTS · TIMELINE MILESTONES
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {hasRole(['ADMIN', 'COORDINATOR']) && (
            <button
              onClick={() => setIsNewDispatchOpen(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Launch Convoy</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by convoy code, driver, or incident..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 font-mono"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="STAGING">Staging</option>
          <option value="EN_ROUTE">En Route</option>
          <option value="DELIVERING">Delivering</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Dispatches Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {isLoading ? (
          <TableSkeleton rows={4} cols={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="py-3 px-4 font-semibold">Convoy ID & Carrier</th>
                  <th className="py-3 px-4 font-semibold">Target Incident</th>
                  <th className="py-3 px-4 font-semibold">Origin Hub</th>
                  <th className="py-3 px-4 font-semibold">Progress</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredDispatches.map(disp => (
                  <tr
                    key={disp.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedDispatch(disp)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white font-mono text-xs">{disp.code}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {disp.carrierIdentifier} · {disp.driverOrPilot}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      <div className="line-clamp-1">{disp.incidentTitle}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {disp.originWarehouseName.split('(')[0]}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-amber-500 h-1.5 rounded-full"
                            style={{ width: `${disp.progressPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-amber-400">{disp.progressPercent}%</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={disp.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {disp.progressPercent < 100 && (
                          <button
                            onClick={() => handleAdvanceTelemetry(disp.id, disp.progressPercent)}
                            className="px-2 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[11px] font-mono flex items-center gap-1 hover:bg-amber-900"
                            title="Fast-Advance Telemetry +25%"
                          >
                            <FastForward className="w-3 h-3" />
                            <span>+25%</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedDispatch(disp)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
                        >
                          Manifest
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispatch Details & Timeline Drawer */}
      {selectedDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl text-xs max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-cyan-400 text-xs">{selectedDispatch.code}</span>
                <h3 className="text-base font-bold text-white">{selectedDispatch.carrierIdentifier}</h3>
                <span className="text-slate-400 text-[11px]">
                  Driver: {selectedDispatch.driverOrPilot} · Priority: {selectedDispatch.priority}
                </span>
              </div>
              <button onClick={() => setSelectedDispatch(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Transit Progress:</span>
                <span className="font-mono font-bold text-amber-400">{selectedDispatch.progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${selectedDispatch.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cargo Manifest */}
            <div>
              <h4 className="font-semibold text-white mb-2">Relief Cargo Manifest</h4>
              <div className="space-y-1">
                {selectedDispatch.cargo.map((c, i) => (
                  <div key={i} className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[11px]">
                    <span className="text-slate-300 font-sans">{c.supplyName} ({c.supplySku})</span>
                    <span className="text-emerald-400 font-bold">{c.quantity.toLocaleString()} {c.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispatch Timeline */}
            <div>
              <h4 className="font-semibold text-white mb-2">Dispatch Milestone Timeline</h4>
              <div className="space-y-2 border-l border-slate-800 pl-3 ml-2">
                {selectedDispatch.timeline.map((step, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-slate-950" />
                    <div className="text-[11px] font-mono text-slate-500">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="font-semibold text-white text-xs">{step.label}</div>
                    <p className="text-slate-400 text-[11px]">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedDispatch(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Dispatch Modal */}
      <NewDispatchModal
        isOpen={isNewDispatchOpen}
        onClose={() => setIsNewDispatchOpen(false)}
        warehouses={warehouses as any}
        incidents={incidents as any}
        supplies={supplies as any}
        volunteers={volunteers as any}
        onLaunchDispatch={handleLaunchDispatch}
      />
    </div>
  );
};
