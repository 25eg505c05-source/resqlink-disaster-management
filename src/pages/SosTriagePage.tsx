import React, { useState, useEffect } from 'react';
import { sosApi } from '../api/sosApi';
import { incidentApi } from '../api/incidentApi';
import { volunteerApi } from '../api/volunteerApi';
import { SosTicket, SosStatus, PrioritySuggestion } from '../types/sos';
import { Incident } from '../types/incident';
import { Volunteer } from '../types/volunteer';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { exportToCsv } from '../utils/exportCsv';
import { 
  PhoneCall, 
  Search, 
  Plus, 
  Download, 
  HeartPulse, 
  LifeBuoy, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  X, 
  UserCheck, 
  ShieldAlert, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const SosTriagePage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [tickets, setTickets] = useState<SosTicket[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

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
  const [description, setDescription] = useState('');

  // Triage Confirmation Modal
  const [triagingTicket, setTriagingTicket] = useState<SosTicket | null>(null);
  const [suggestion, setSuggestion] = useState<PrioritySuggestion | null>(null);
  const [selectedResponderIds, setSelectedResponderIds] = useState<string[]>([]);
  const [operatorNotes, setOperatorNotes] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tList, incResp, vList] = await Promise.all([
        sosApi.getSosTickets(),
        incidentApi.getIncidents(),
        volunteerApi.getVolunteers(),
      ]);
      setTickets(tList);
      setIncidents(incResp.items);
      setVolunteers(vList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchesSearch = 
      t.ticketNumber.toLowerCase().includes(q) ||
      t.callerName.toLowerCase().includes(q) ||
      t.address.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || t.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleOpenTriage = (ticket: SosTicket) => {
    setTriagingTicket(ticket);
    const calc = sosApi.getPrioritySuggestion(ticket);
    setSuggestion(calc);
    setSelectedResponderIds(ticket.assignedResponderIds || []);
    setOperatorNotes(ticket.operatorNotes || '');
  };

  const handleConfirmTriage = async (newStatus: SosStatus) => {
    if (!triagingTicket || !user) return;

    await sosApi.updateSos(triagingTicket.id, {
      status: newStatus,
      severity: suggestion?.calculatedSeverity || triagingTicket.severity,
      assignedResponderIds: selectedResponderIds,
      operatorNotes,
    }, user);

    // If assigned responders, mark them deployed
    if (selectedResponderIds.length > 0 && newStatus === 'DISPATCHED') {
      for (const vId of selectedResponderIds) {
        await volunteerApi.updateVolunteerStatus(vId, 'DEPLOYED', triagingTicket.incidentId, `Rescue Mission: ${triagingTicket.ticketNumber}`, user);
      }
    }

    setTriagingTicket(null);
    loadData();
  };

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempTicket: Partial<SosTicket> = {
      callerName,
      contactNumber,
      sector,
      address,
      victimCount,
      requiresMedical,
      requiresEvacuation,
      waterRescueNeeded,
      description,
    };
    const calc = sosApi.getPrioritySuggestion(tempTicket);

    await sosApi.createSos({
      ...tempTicket,
      severity: calc.calculatedSeverity,
    });

    setIsIntakeOpen(false);
    resetIntake();
    loadData();
  };

  const resetIntake = () => {
    setCallerName('');
    setContactNumber('');
    setAddress('');
    setDescription('');
    setVictimCount(4);
  };

  const handleExportCsv = () => {
    const data = tickets.map(t => ({
      TicketNumber: t.ticketNumber,
      Caller: t.callerName,
      Contact: t.contactNumber,
      Sector: t.sector,
      Address: t.address,
      Victims: t.victimCount,
      Medical: t.requiresMedical ? 'YES' : 'NO',
      Evacuation: t.requiresEvacuation ? 'YES' : 'NO',
      WaterRescue: t.waterRescueNeeded ? 'YES' : 'NO',
      Severity: t.severity,
      Status: t.status,
      TimeReceived: t.timeReceived,
    }));
    exportToCsv('sos_distress_tickets', data);
  };

  const availableVolunteers = volunteers.filter(v => v.status === 'AVAILABLE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Distress SOS & Priority Triage Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            OPERATOR TRIAGE QUEUE · LIFE-SAFETY PRIORITY ENGINE · CITIZEN INTAKE
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

          <button
            onClick={() => setIsIntakeOpen(true)}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Log SOS Call</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SOS tickets by number, caller, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Triage</option>
            <option value="TRIAGED">Triaged</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical P1</option>
            <option value="HIGH">High P2</option>
            <option value="MEDIUM">Medium P3</option>
          </select>
        </div>
      </div>

      {/* SOS Tickets List */}
      <div className="space-y-3">
        {isLoading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            No distress calls matching filter criteria.
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const isCritical = ticket.severity === 'CRITICAL';
            const isPending = ticket.status === 'PENDING';
            const isResolved = ticket.status === 'RESOLVED';

            return (
              <div
                key={ticket.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCritical && isPending
                    ? 'bg-rose-950/20 border-rose-800/80 shadow-rose-950/20 shadow-md'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    {/* Header line */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-white text-sm">
                        {ticket.ticketNumber}
                      </span>
                      <span className="text-slate-500">·</span>
                      <StatusBadge status={ticket.severity} />
                      <StatusBadge status={ticket.status} />
                      <span className="text-slate-500">·</span>
                      <span className="font-mono text-slate-400">
                        {new Date(ticket.timeReceived).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Caller & Location */}
                    <div className="text-xs text-slate-300">
                      <strong className="text-white">{ticket.callerName}</strong>
                      <span className="text-slate-500 font-mono ml-2">({ticket.contactNumber})</span>
                      <span className="mx-2 text-slate-600">|</span>
                      <span>{ticket.address}</span>
                      <span className="text-slate-500 font-mono ml-1">({ticket.sector})</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      {ticket.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-300">
                        {ticket.victimCount} Stranded / Victims
                      </span>
                      {ticket.requiresMedical && (
                        <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <HeartPulse className="w-3 h-3 text-rose-400" />
                          Emergency Medical
                        </span>
                      )}
                      {ticket.waterRescueNeeded && (
                        <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <LifeBuoy className="w-3 h-3 text-cyan-400" />
                          Swift-Water Boat
                        </span>
                      )}
                      {ticket.assignedResponderIds.length > 0 && (
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                          {ticket.assignedResponderIds.length} Responders Assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-2 text-xs shrink-0">
                    {!isResolved && (
                      <button
                        onClick={() => handleOpenTriage(ticket)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Triage & Mobilize</span>
                      </button>
                    )}

                    {isResolved && (
                      <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Operator Triage & Dispatch Confirmation Modal */}
      {triagingTicket && suggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl text-xs max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-cyan-400 text-xs">{triagingTicket.ticketNumber}</span>
                <h3 className="text-base font-bold text-white">Operator Triage & Confirmation</h3>
              </div>
              <button onClick={() => setTriagingTicket(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smart Suggestion Recommendation Box */}
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  AUTOMATIC PRIORITY RECOMMENDATION
                </span>
                <StatusBadge status={suggestion.calculatedSeverity} />
              </div>
              <div className="font-semibold text-white text-xs">{suggestion.recommendedAction}</div>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                {suggestion.reasons.map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5 font-mono">
                    <span className="text-emerald-400">✓</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assign Available Responders */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Assign Certified Responders to this SOS:
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
                {availableVolunteers.map(vol => {
                  const isSelected = selectedResponderIds.includes(vol.id);
                  return (
                    <button
                      key={vol.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedResponderIds(selectedResponderIds.filter(id => id !== vol.id));
                        } else {
                          setSelectedResponderIds([...selectedResponderIds, vol.id]);
                        }
                      }}
                      className={`p-2 rounded border text-left transition-colors ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold truncate">{vol.fullName}</div>
                      <div className="font-mono text-[10px] text-slate-500">{vol.primarySkill.replace(/_/g, ' ')}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Operator Notes */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Operator Notes / Radio Transcripts</label>
              <textarea
                rows={2}
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
                placeholder="Logged coordinates verified with USGS levee maps. Boat access via ramp 4..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleConfirmTriage('RESOLVED')}
                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                Mark Extracted / Resolved
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleConfirmTriage('TRIAGED')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Accept Priority Only
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmTriage('DISPATCHED')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm & Dispatch Rescue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOS Intake Modal */}
      {isIntakeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-rose-500" />
                <span>Log Incoming Emergency Distress Call</span>
              </h3>
              <button onClick={() => setIsIntakeOpen(false)} className="text-slate-400 hover:text-white">
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
                    placeholder="e.g. Evelyn St. Claire"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+1 (555) 723-9081"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Sector</label>
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
                  <label className="block text-slate-300 font-medium mb-1">Stranded / Victims Count</label>
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
                <label className="block text-slate-300 font-medium mb-1">Address / Landmark</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 419 Bayou Road near Shell Beach"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresMedical}
                    onChange={(e) => setRequiresMedical(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-rose-600 focus:ring-0"
                  />
                  <span>Medical Emergency</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={waterRescueNeeded}
                    onChange={(e) => setWaterRescueNeeded(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-0"
                  />
                  <span>Swift-Water Boat Needed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresEvacuation}
                    onChange={(e) => setRequiresEvacuation(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-amber-600 focus:ring-0"
                  />
                  <span>Evacuation Requested</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Situation Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Elderly diabetic grandmother with rising floodwaters to first floor ceiling..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
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
                  Queue for Triage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
