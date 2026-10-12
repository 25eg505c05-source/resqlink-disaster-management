import React, { useState, useEffect } from 'react';
import { volunteerApi } from '../api/volunteerApi';
import { incidentApi } from '../api/incidentApi';
import { Volunteer, VolunteerSkill, VolunteerStatus, MatchScoreResult } from '../types/volunteer';
import { Incident } from '../types/incident';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { exportToCsv } from '../utils/exportCsv';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  Compass, 
  Award, 
  Phone, 
  MapPin, 
  UserCheck, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';

export const VolunteersPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Smart Matching State
  const [matchIncidentId, setMatchIncidentId] = useState<string>('');
  const [matchedResults, setMatchedResults] = useState<MatchScoreResult[] | null>(null);

  // Register Modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBloodType, setNewBloodType] = useState('O_POS');
  const [newPrimarySkill, setNewPrimarySkill] = useState<VolunteerSkill>('SEARCH_AND_RESCUE');
  const [newCertifications, setNewCertifications] = useState('USAR Level II, First Aid');
  const [newLocation, setNewLocation] = useState('Forward Staging Hub Delta');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vList, incResp] = await Promise.all([
        volunteerApi.getVolunteers(),
        incidentApi.getIncidents(),
      ]);
      setVolunteers(vList);
      setIncidents(incResp.items);
      if (incResp.items.length > 0 && !matchIncidentId) {
        setMatchIncidentId(incResp.items[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter list
  const filteredVolunteers = volunteers.filter(v => {
    const q = search.toLowerCase();
    const matchesSearch = 
      v.fullName.toLowerCase().includes(q) ||
      v.badgeNumber.toLowerCase().includes(q) ||
      v.certifications.some(c => c.toLowerCase().includes(q));
    const matchesSkill = skillFilter === 'ALL' || v.primarySkill === skillFilter || v.skills.includes(skillFilter as any);
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesSkill && matchesStatus;
  });

  const handleRunSmartMatch = () => {
    const inc = incidents.find(i => i.id === matchIncidentId);
    if (!inc) return;

    // Determine required skills from incident type and resources
    const reqSkills: string[] = ['SEARCH_AND_RESCUE'];
    if (inc.type === 'FLASH_FLOOD' || inc.type === 'HURRICANE') reqSkills.push('WATER_RESCUE_BOAT');
    if (inc.type === 'MEDICAL_SURGE' || inc.severity === 'CRITICAL') reqSkills.push('PARAMEDIC_EMT', 'TRIAGE_NURSING');
    if (inc.type === 'STRUCTURAL_COLLAPSE') reqSkills.push('HEAVY_EQUIPMENT');

    const results = volunteerApi.getSmartMatches(inc, reqSkills);
    setMatchedResults(results);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await volunteerApi.registerVolunteer({
      fullName: newName,
      phone: newPhone,
      email: newEmail,
      bloodType: newBloodType,
      primarySkill: newPrimarySkill,
      skills: [newPrimarySkill],
      status: 'AVAILABLE',
      currentLocationName: newLocation,
      certifications: newCertifications.split(',').map(s => s.trim()),
    }, user);

    setIsRegisterOpen(false);
    loadData();
  };

  const handleStatusChange = async (volId: string, newStatus: VolunteerStatus) => {
    if (!user) return;
    await volunteerApi.updateVolunteerStatus(volId, newStatus, undefined, undefined, user);
    loadData();
  };

  const handleExportCsv = () => {
    const data = volunteers.map(v => ({
      Badge: v.badgeNumber,
      Name: v.fullName,
      Phone: v.phone,
      Email: v.email,
      BloodType: v.bloodType,
      PrimarySkill: v.primarySkill,
      Status: v.status,
      Location: v.currentLocationName,
      MissionsCompleted: v.totalMissionsCompleted,
    }));
    exportToCsv('volunteers_cadre_report', data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Emergency Responders & Field Cadre
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            USAR · EMT PARAMEDICS · SWIFTWATER SQUADS · SMART PROXIMITY MATCHING
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
              onClick={() => setIsRegisterOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Responder</span>
            </button>
          )}
        </div>
      </div>

      {/* Smart Responder Matching Section */}
      <div className="p-4 rounded-xl border border-indigo-900/60 bg-gradient-to-r from-indigo-950/30 via-slate-900 to-slate-900 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Smart Responder Skill Matching</h3>
              <p className="text-slate-400 text-xs">
                Analyzes disaster type requirements, proximity estimates, and verified certifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={matchIncidentId}
              onChange={(e) => setMatchIncidentId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none"
            >
              {incidents.map(i => (
                <option key={i.id} value={i.id}>{i.code}: {i.title.slice(0, 32)}...</option>
              ))}
            </select>

            <button
              onClick={handleRunSmartMatch}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap shadow-sm"
            >
              Analyze & Match Squads
            </button>
          </div>
        </div>

        {/* Matched Results Cards */}
        {matchedResults && (
          <div className="pt-2 border-t border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 mb-2">
              RECOMMENDED CANDIDATES ({matchedResults.length} EVALUATED):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {matchedResults.slice(0, 3).map(res => (
                <div key={res.volunteer.id} className="p-3 bg-slate-950 rounded-xl border border-indigo-500/40 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{res.volunteer.fullName}</span>
                    <span className="font-mono text-emerald-400 font-bold">{res.matchScore}% Match</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 flex justify-between">
                    <span>Specialty: {res.volunteer.primarySkill.replace(/_/g, ' ')}</span>
                    <span>~{res.approxDistanceKm} km away</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                    <StatusBadge status={res.volunteer.status} />
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold">{res.recommendationTag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search responders by name, badge, or certification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none"
          >
            <option value="ALL">All Specialties</option>
            <option value="SEARCH_AND_RESCUE">Search & Rescue</option>
            <option value="PARAMEDIC_EMT">Paramedic / EMT</option>
            <option value="WATER_RESCUE_BOAT">Water Rescue Boat</option>
            <option value="HEAVY_EQUIPMENT">Heavy Equipment</option>
            <option value="DRONE_RECON">Drone Recon</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="DEPLOYED">Deployed</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="STANDBY">Standby</option>
          </select>
        </div>
      </div>

      {/* Volunteers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-3"><TableSkeleton rows={3} cols={4} /></div>
        ) : (
          filteredVolunteers.map(vol => (
            <div key={vol.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between shadow-sm">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{vol.fullName}</h3>
                    <div className="text-[11px] font-mono text-slate-500">
                      Badge: {vol.badgeNumber} · Blood: {vol.bloodType}
                    </div>
                  </div>
                  <StatusBadge status={vol.status} />
                </div>

                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{vol.primarySkill.replace(/_/g, ' ')} ({vol.experienceYears}y exp)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{vol.currentLocationName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-mono text-[11px]">{vol.phone}</span>
                  </div>
                </div>

                {vol.currentIncidentName && (
                  <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px]">
                    <span className="text-slate-500 block">Mission Assignment:</span>
                    <span className="text-amber-300 font-medium truncate block">{vol.currentIncidentName}</span>
                  </div>
                )}

                <div className="pt-1">
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">CERTIFICATIONS:</span>
                  <div className="flex flex-wrap gap-1">
                    {vol.certifications.map((c, i) => (
                      <span key={i} className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-[10px] font-mono text-slate-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500 text-[11px]">
                  {vol.totalMissionsCompleted} Missions
                </span>

                {hasRole(['ADMIN', 'COORDINATOR']) && (
                  vol.status === 'DEPLOYED' ? (
                    <button
                      onClick={() => handleStatusChange(vol.id, 'AVAILABLE')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                    >
                      Stand Down
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(vol.id, 'DEPLOYED')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs transition-colors flex items-center gap-1"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>Deploy</span>
                    </button>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Register Volunteer Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Register Emergency Responder</h3>
              <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Rachel Sterling"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="responder@resqlink.org"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Blood Type</label>
                  <select
                    value={newBloodType}
                    onChange={(e) => setNewBloodType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  >
                    <option value="O_POS">O Positive</option>
                    <option value="O_NEG">O Negative</option>
                    <option value="A_POS">A Positive</option>
                    <option value="A_NEG">A Negative</option>
                    <option value="B_POS">B Positive</option>
                    <option value="AB_POS">AB Positive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Primary Specialty Skill</label>
                <select
                  value={newPrimarySkill}
                  onChange={(e) => setNewPrimarySkill(e.target.value as VolunteerSkill)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="SEARCH_AND_RESCUE">Search and Rescue (SAR)</option>
                  <option value="PARAMEDIC_EMT">Emergency Paramedic / EMT</option>
                  <option value="WATER_RESCUE_BOAT">Water Rescue / Boat Operator</option>
                  <option value="HEAVY_EQUIPMENT">Heavy Equipment Operator</option>
                  <option value="DRONE_RECON">Drone Reconnaissance Pilot</option>
                  <option value="LOGISTICS_DRIVER">Logistics Transport Driver</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Certifications (comma separated)</label>
                <input
                  type="text"
                  value={newCertifications}
                  onChange={(e) => setNewCertifications(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Staging Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                >
                  Save Responder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
