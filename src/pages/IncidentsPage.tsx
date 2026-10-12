import React, { useState, useEffect } from 'react';
import { incidentApi } from '../api/incidentApi';
import { Incident, IncidentSeverity, IncidentStatus, DisasterType } from '../types/incident';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { exportToCsv } from '../utils/exportCsv';
import { 
  ShieldAlert, 
  Search, 
  Plus, 
  Download, 
  Filter, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  Clock, 
  X, 
  Edit3, 
  Trash2, 
  Users, 
  Truck,
  PhoneCall
} from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');

  // Modal states
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [disasterType, setDisasterType] = useState<DisasterType>('HURRICANE');
  const [severity, setSeverity] = useState<IncidentSeverity>('HIGH');
  const [sector, setSector] = useState('Sector 4 - Lower Coastal Delta');
  const [address, setAddress] = useState('');
  const [affectedPopulation, setAffectedPopulation] = useState(5000);
  const [description, setDescription] = useState('');

  const loadIncidents = async () => {
    setIsLoading(true);
    try {
      const resp = await incidentApi.getIncidents({
        search: search || undefined,
        severity: severityFilter as any,
        status: statusFilter as any,
        type: typeFilter as any,
        sector: sectorFilter !== 'ALL' ? sectorFilter : undefined,
      });
      setIncidents(resp.items);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [search, severityFilter, statusFilter, typeFilter, sectorFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingIncident) {
      await incidentApi.updateIncident(editingIncident.id, {
        title,
        type: disasterType,
        severity,
        location: { ...editingIncident.location, sector, address },
        affectedPopulation,
        description,
      }, user);
    } else {
      await incidentApi.createIncident({
        title,
        type: disasterType,
        severity,
        location: { sector, address, lat: 29.90, lng: -90.05 },
        affectedPopulation,
        description,
        commander: user.fullName,
      }, user);
    }

    setIsCreateOpen(false);
    setEditingIncident(null);
    resetForm();
    loadIncidents();
  };

  const resetForm = () => {
    setTitle('');
    setAddress('');
    setDescription('');
    setAffectedPopulation(5000);
  };

  const handleEditClick = (inc: Incident) => {
    setEditingIncident(inc);
    setTitle(inc.title);
    setDisasterType(inc.type);
    setSeverity(inc.severity);
    setSector(inc.location.sector);
    setAddress(inc.location.address);
    setAffectedPopulation(inc.affectedPopulation);
    setDescription(inc.description);
    setIsCreateOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!user || !window.confirm('Are you sure you want to de-escalate and archive this incident?')) return;
    await incidentApi.deleteIncident(id, user);
    loadIncidents();
  };

  const handleExportCsv = () => {
    const exportData = incidents.map(i => ({
      Code: i.code,
      Title: i.title,
      Type: i.type,
      Severity: i.severity,
      Status: i.status,
      Sector: i.location.sector,
      Address: i.location.address,
      AffectedPopulation: i.affectedPopulation,
      Commander: i.commander,
      ReportedAt: i.reportedAt,
    }));
    exportToCsv('disaster_incidents_report', exportData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Disaster Incidents Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            OPERATIONAL THEATER INCIDENT COMMAND SYSTEM (ICS)
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
              onClick={() => {
                setEditingIncident(null);
                resetForm();
                setIsCreateOpen(true);
              }}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Declare Incident</span>
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
            placeholder="Search by code, title, or sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical P1</option>
            <option value="HIGH">High P2</option>
            <option value="MEDIUM">Medium P3</option>
            <option value="LOW">Low P4</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="CONTAINED">Contained</option>
            <option value="VERIFIED">Verified</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="HURRICANE">Hurricane</option>
            <option value="FLASH_FLOOD">Flash Flood</option>
            <option value="STRUCTURAL_COLLAPSE">Collapse</option>
            <option value="MEDICAL_SURGE">Medical Surge</option>
          </select>
        </div>
      </div>

      {/* Incident Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {isLoading ? (
          <TableSkeleton rows={4} cols={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="py-3 px-4 font-semibold">Incident Code & Title</th>
                  <th className="py-3 px-4 font-semibold">Disaster Type</th>
                  <th className="py-3 px-4 font-semibold">Severity</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Sector & Population</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No disaster incidents matching filter parameters.
                    </td>
                  </tr>
                ) : (
                  incidents.map(inc => (
                    <tr
                      key={inc.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedIncident(inc)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-sm">{inc.title}</div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          {inc.code} · Cmdr: {inc.commander}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {inc.type.replace(/_/g, ' ')}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={inc.severity} />
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={inc.status} />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-200">{inc.location.sector}</div>
                        <div className="text-[11px] font-mono text-amber-400">
                          {inc.affectedPopulation.toLocaleString()} citizens affected
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedIncident(inc)}
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                            title="View Incident Telemetry"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          {hasRole(['ADMIN', 'COORDINATOR']) && (
                            <button
                              onClick={() => handleEditClick(inc)}
                              className="p-1.5 text-slate-400 hover:text-cyan-400 rounded hover:bg-slate-800 transition-colors"
                              title="Edit Incident"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {hasRole(['ADMIN']) && (
                            <button
                              onClick={() => handleDeleteClick(inc.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                              title="Deactivate Incident"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Incident Detail Drawer / Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl text-xs max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-cyan-400 font-bold">{selectedIncident.code}</span>
                  <StatusBadge status={selectedIncident.severity} />
                  <StatusBadge status={selectedIncident.status} />
                </div>
                <h3 className="text-base font-bold text-white">{selectedIncident.title}</h3>
                <span className="text-slate-400 font-mono text-[11px]">
                  Commander: {selectedIncident.commander}
                </span>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
              {selectedIncident.description}
            </p>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-500 block">Sector Landmark</span>
                <span className="text-slate-200">{selectedIncident.location.sector}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Street / Waypoint</span>
                <span className="text-slate-200">{selectedIncident.location.address}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Reported Timestamp</span>
                <span className="text-slate-200 font-mono">{new Date(selectedIncident.reportedAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Estimated Population</span>
                <span className="text-amber-400 font-bold font-mono">{selectedIncident.affectedPopulation.toLocaleString()} citizens</span>
              </div>
            </div>

            {/* Required Resources */}
            <div>
              <h4 className="font-semibold text-white mb-2">Required Emergency Relief Resources</h4>
              <div className="space-y-1.5">
                {selectedIncident.requiredResources.map((res, i) => (
                  <div key={i} className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[11px]">
                    <span className="text-slate-300">{res.category}</span>
                    <span className="text-cyan-400 font-semibold">{res.quantity.toLocaleString()} {res.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="font-semibold text-white mb-2">Operational Incident Timeline</h4>
              <div className="space-y-2 border-l border-slate-800 pl-3 ml-2">
                {selectedIncident.timeline.map(tl => (
                  <div key={tl.id} className="relative">
                    <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-950" />
                    <div className="text-[11px] font-mono text-slate-500">
                      {new Date(tl.timestamp).toLocaleTimeString()} · {tl.authorName}
                    </div>
                    <div className="font-semibold text-white text-xs">{tl.title}</div>
                    <p className="text-slate-400 text-[11px]">{tl.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Incident Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">
                {editingIncident ? 'Edit Incident Parameters' : 'Declare New Disaster Emergency Zone'}
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Incident Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flash Flood Inundation & Levee Break"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Disaster Type</label>
                  <select
                    value={disasterType}
                    onChange={(e) => setDisasterType(e.target.value as DisasterType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="HURRICANE">Hurricane</option>
                    <option value="FLASH_FLOOD">Flash Flood</option>
                    <option value="STRUCTURAL_COLLAPSE">Structural Collapse</option>
                    <option value="WILDFIRE">Wildfire</option>
                    <option value="EARTHQUAKE">Earthquake</option>
                    <option value="MEDICAL_SURGE">Medical Surge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Severity Rating</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  >
                    <option value="CRITICAL">Critical (P1)</option>
                    <option value="HIGH">High (P2)</option>
                    <option value="MEDIUM">Medium (P3)</option>
                    <option value="LOW">Low (P4)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Geographic Sector</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Sector 4 - Lower Coastal Delta">Sector 4 - Lower Coastal Delta</option>
                    <option value="Sector 2 - Central Metro">Sector 2 - Central Metro</option>
                    <option value="Sector 3 - Waterfront Industrial">Sector 3 - Waterfront Industrial</option>
                    <option value="Sector 1 - Evacuation Zone A">Sector 1 - Evacuation Zone A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Est. Affected Population</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={affectedPopulation}
                    onChange={(e) => setAffectedPopulation(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Address / Landmark Landmark</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Grand Pass Causeway & Mile Marker 12"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Situation Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe situational hazards, water depths, or structures impacted..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium transition-colors"
                >
                  {editingIncident ? 'Save Updates' : 'Declare & Mobilize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
