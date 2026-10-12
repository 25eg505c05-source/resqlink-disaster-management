import React, { useState } from 'react';
import { 
  SosTriageTicket, 
  DisasterIncident, 
  IncidentSeverity,
  DispatchMission 
} from '../../types/disaster';
import { 
  AlertCircle, 
  PhoneCall, 
  LifeBuoy, 
  HeartPulse, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  ShieldAlert, 
  ArrowUpRight,
  Send,
  X
} from 'lucide-react';

interface IncidentTriageProps {
  sosTickets: SosTriageTicket[];
  incidents: DisasterIncident[];
  dispatches: DispatchMission[];
  onUpdateSosStatus: (id: string, status: SosTriageTicket['status'], dispatchId?: string) => void;
  onCreateSosTicket: (ticket: Omit<SosTriageTicket, 'id' | 'ticketNumber' | 'status' | 'timeReceived'>) => void;
  onOpenNewDispatch: (incidentId?: string) => void;
}

export default function IncidentTriage({
  sosTickets,
  incidents,
  dispatches,
  onUpdateSosStatus,
  onCreateSosTicket,
  onOpenNewDispatch,
}: IncidentTriageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Intake modal
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [callerName, setCallerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [sector, setSector] = useState('Sector 4 - Lower Coastal Delta');
  const [address, setAddress] = useState('');
  const [victimCount, setVictimCount] = useState(4);
  const [requiresMedical, setRequiresMedical] = useState(true);
  const [requiresEvacuation, setRequiresEvacuation] = useState(true);
  const [waterRescueNeeded, setWaterRescueNeeded] = useState(false);
  const [severity, setSeverity] = useState<IncidentSeverity>('CRITICAL');
  const [description, setDescription] = useState('');

  const filteredTickets = sosTickets.filter(t => {
    const matchesSearch = 
      t.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || t.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const criticalCount = sosTickets.filter(t => t.severity === 'CRITICAL' && t.status !== 'RESOLVED').length;
  const pendingCount = sosTickets.filter(t => t.status === 'PENDING').length;

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateSosTicket({
      callerName,
      contactNumber,
      sector,
      address,
      lat: 29.90 + (Math.random() - 0.5) * 0.08,
      lng: -90.05 + (Math.random() - 0.5) * 0.08,
      victimCount,
      requiresMedical,
      requiresEvacuation,
      waterRescueNeeded,
      severity,
      description,
    });

    setIsIntakeOpen(false);
    setCallerName('');
    setContactNumber('');
    setAddress('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-xl border border-rose-900/60 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 font-mono mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>EMERGENCY 911 / EOC SOS INTAKE</span>
            <span aria-hidden="true">·</span>
            <span>REAL-TIME CITIZEN DISTRESS QUEUE</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Distress SOS & Priority Triage Matrix
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mt-1 leading-relaxed">
            Direct ingestion of field distress calls, triage categorization by life threat, and immediate linkage to dispatch missions.
          </p>
        </div>

        <button
          onClick={() => setIsIntakeOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm whitespace-nowrap"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Log Incoming SOS Call</span>
        </button>
      </div>

      {/* Tactical Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 block text-[11px]">Pending Triage Queue</span>
          <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">{pendingCount}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Awaiting classification</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 block text-[11px]">Critical Life-Threat (P1)</span>
          <span className="text-xl font-bold font-mono text-rose-400 tabular-nums">{criticalCount}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Immediate intervention</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 block text-[11px]">Active Incident Zones</span>
          <span className="text-xl font-bold font-mono text-white tabular-nums">
            {incidents.filter(i => i.status === 'ACTIVE').length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Task forces deployed</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 block text-[11px]">En-Route Convoys</span>
          <span className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
            {dispatches.filter(d => d.status === 'EN_ROUTE' || d.status === 'DELIVERING').length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Active relief transit</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search SOS calls by name, address, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical (P1)</option>
            <option value="HIGH">High (P2)</option>
            <option value="MEDIUM">Medium (P3)</option>
            <option value="LOW">Low (P4)</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Tickets ({sosTickets.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'PENDING' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('DISPATCHED')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'DISPATCHED' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dispatched
          </button>
          <button
            onClick={() => setStatusFilter('RESOLVED')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* SOS Tickets List */}
      <div className="space-y-3">
        {filteredTickets.map(ticket => {
          const isCritical = ticket.severity === 'CRITICAL';
          const isPending = ticket.status === 'PENDING';
          const isDispatched = ticket.status === 'DISPATCHED';
          const isResolved = ticket.status === 'RESOLVED';

          return (
            <div
              key={ticket.id}
              className={`rounded-xl border p-4 transition-colors ${
                isCritical && isPending
                  ? 'bg-rose-950/20 border-rose-800/80'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  {/* Top line metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-white text-sm">
                      {ticket.ticketNumber}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className={`font-mono font-semibold ${
                      isCritical ? 'text-rose-400' :
                      ticket.severity === 'HIGH' ? 'text-amber-400' :
                      'text-sky-400'
                    }`}>
                      {ticket.severity} PRIORITY
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400 font-mono">
                      {new Date(ticket.timeReceived).toLocaleTimeString()}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300 font-medium">
                      {ticket.victimCount} People Stranded / At Risk
                    </span>
                  </div>

                  {/* Caller & Location */}
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold text-white">{ticket.callerName}</span>
                    <span className="text-slate-500 font-mono ml-2">({ticket.contactNumber})</span>
                    <span className="mx-2 text-slate-600">|</span>
                    <span className="text-slate-400">{ticket.address}</span>
                    <span className="text-slate-500 font-mono ml-1">({ticket.sector})</span>
                  </div>

                  {/* Situation description */}
                  <p className="text-slate-300 text-xs leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    {ticket.description}
                  </p>

                  {/* Badges: Medical, Evac, Water Rescue */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
                    {ticket.requiresMedical && (
                      <span className="flex items-center gap-1 text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        <HeartPulse className="w-3 h-3" />
                        Medical Emergency
                      </span>
                    )}
                    {ticket.waterRescueNeeded && (
                      <span className="flex items-center gap-1 text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        <LifeBuoy className="w-3 h-3" />
                        Water Extraction Boat Needed
                      </span>
                    )}
                    {ticket.requiresEvacuation && (
                      <span className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <AlertCircle className="w-3 h-3" />
                        Evacuation Requested
                      </span>
                    )}
                    {ticket.allocatedDispatchId && (
                      <span className="text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Assigned: {ticket.allocatedDispatchId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Triage Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-2 text-xs shrink-0">
                  <div className={`px-2.5 py-1 rounded font-mono font-semibold text-[11px] ${
                    isResolved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    isDispatched ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                    isPending ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    STATUS: {ticket.status}
                  </div>

                  {isPending && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateSosStatus(ticket.id, 'TRIAGED')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors"
                      >
                        Accept & Triage
                      </button>
                      <button
                        onClick={() => {
                          onUpdateSosStatus(ticket.id, 'DISPATCHED', 'disp-01');
                          onOpenNewDispatch();
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium transition-colors flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Dispatch Rescue</span>
                      </button>
                    </div>
                  )}

                  {isDispatched && (
                    <button
                      onClick={() => onUpdateSosStatus(ticket.id, 'RESOLVED')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-medium transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Extracted & Resolved</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Intake SOS Modal */}
      {isIntakeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-rose-500" />
                <span>Log Incoming Emergency Distress Call</span>
              </h3>
              <button 
                onClick={() => setIsIntakeOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIntakeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Caller Name</label>
                  <input
                    type="text"
                    required
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    placeholder="e.g. Captain Gary Barnes"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Caller Contact Number</label>
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+1 (555) 923-4011"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Sector / Zone</label>
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
                  <label className="block text-slate-300 font-medium mb-1">Est. Stranded / Victims</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={victimCount}
                    onChange={(e) => setVictimCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Street Address or Coordinates Landmark</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 812 Riverbend Rd near Mile Marker 14"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Triage Severity Rating</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  >
                    <option value="CRITICAL">P1 - CRITICAL (Imminent Loss of Life)</option>
                    <option value="HIGH">P2 - HIGH (Urgent Rescue Required)</option>
                    <option value="MEDIUM">P3 - MEDIUM (Essential Aid Needed)</option>
                    <option value="LOW">P4 - LOW (Non-Emergency Resource)</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end gap-1 text-[11px] text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiresMedical}
                      onChange={(e) => setRequiresMedical(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-rose-600 focus:ring-0"
                    />
                    <span>Requires Emergency Medical</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={waterRescueNeeded}
                      onChange={(e) => setWaterRescueNeeded(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-cyan-600 focus:ring-0"
                    />
                    <span>Swift-Water Boat Extraction</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Situation Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe hazard conditions, stranded elevations, injuries, or urgent supplies needed..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsIntakeOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium transition-colors"
                >
                  Queue for Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
