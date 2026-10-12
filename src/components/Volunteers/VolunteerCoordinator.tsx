import React, { useState } from 'react';
import { 
  Volunteer, 
  DisasterIncident, 
  VolunteerSkill, 
  VolunteerStatus 
} from '../../types/disaster';
import { 
  Users, 
  Search, 
  Plus, 
  UserCheck, 
  ShieldAlert, 
  Award, 
  Phone, 
  MapPin, 
  Compass, 
  Activity, 
  CheckCircle2,
  X
} from 'lucide-react';

const VOLUNTEER_TEAM_IMG = '/src/assets/images/volunteer_rescue_team_1791462593323.jpg';

interface VolunteerCoordinatorProps {
  volunteers: Volunteer[];
  incidents: DisasterIncident[];
  onRegisterVolunteer: (vol: Omit<Volunteer, 'id' | 'badgeNumber' | 'totalMissionsCompleted'>) => void;
  onUpdateVolunteerStatus: (id: string, status: VolunteerStatus, incidentId?: string, incidentName?: string) => void;
}

export default function VolunteerCoordinator({
  volunteers,
  incidents,
  onRegisterVolunteer,
  onUpdateVolunteerStatus,
}: VolunteerCoordinatorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Deployment modal state
  const [deployingVolunteer, setDeployingVolunteer] = useState<Volunteer | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');

  // Register Modal state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBloodType, setNewBloodType] = useState('O_POS');
  const [newPrimarySkill, setNewPrimarySkill] = useState<VolunteerSkill>('SEARCH_AND_RESCUE');
  const [newCertifications, setNewCertifications] = useState('');
  const [newLocation, setNewLocation] = useState('Forward Staging Hub Delta');

  // Smart Proximity Dispatch state
  const [batchDispatchIncidentId, setBatchDispatchIncidentId] = useState<string>('');
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);

  const filteredVolunteers = volunteers.filter(v => {
    const matchesSearch = 
      v.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.certifications.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSkill = skillFilter === 'ALL' || v.primarySkill === skillFilter || v.skills.includes(skillFilter as VolunteerSkill);
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesSkill && matchesStatus;
  });

  const availableCount = volunteers.filter(v => v.status === 'AVAILABLE').length;
  const deployedCount = volunteers.filter(v => v.status === 'DEPLOYED' || v.status === 'IN_TRANSIT').length;

  const handleExecuteDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deployingVolunteer || !selectedIncidentId) return;
    const inc = incidents.find(i => i.id === selectedIncidentId);
    if (!inc) return;

    onUpdateVolunteerStatus(deployingVolunteer.id, 'DEPLOYED', inc.id, inc.title);
    setDeployingVolunteer(null);
  };

  const handleSmartBatchDispatch = () => {
    if (!batchDispatchIncidentId) return;
    const inc = incidents.find(i => i.id === batchDispatchIncidentId);
    if (!inc) return;

    // Pick up to 3 available volunteers
    const candidates = volunteers.filter(v => v.status === 'AVAILABLE').slice(0, 3);
    if (candidates.length === 0) return;

    candidates.forEach(c => {
      onUpdateVolunteerStatus(c.id, 'DEPLOYED', inc.id, inc.title);
    });

    setBatchSuccessMsg(`Dispatched ${candidates.length} responders to ${inc.code}`);
    setTimeout(() => setBatchSuccessMsg(null), 4000);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const certArray = newCertifications
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    onRegisterVolunteer({
      fullName: newName,
      phone: newPhone,
      email: newEmail,
      bloodType: newBloodType,
      primarySkill: newPrimarySkill,
      skills: [newPrimarySkill],
      status: 'AVAILABLE',
      currentLocationName: newLocation,
      lat: 29.94 + (Math.random() - 0.5) * 0.05,
      lng: -90.07 + (Math.random() - 0.5) * 0.05,
      certifications: certArray.length > 0 ? certArray : ['Basic First Aid & CPR', 'ICS-100 Incident Command'],
    });

    setIsRegisterOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewCertifications('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <img 
            src={VOLUNTEER_TEAM_IMG} 
            alt="Disaster Response Field Responders" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative p-6 z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
              <span>CIVIL DEFENSE & VOLUNTEER CADRE</span>
              <span aria-hidden="true">·</span>
              <span>CERTIFIED USAR & EMT SQUADS</span>
              <span aria-hidden="true">·</span>
              <span>RADIO TELEMETRY ACTIVE</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Volunteer Mobilization & Field Coordination
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Real-time squad positioning, specialty credential tracking, and rapid proximity dispatch to active disaster sectors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Responder</span>
            </button>
          </div>
        </div>

        {/* Tactical Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-800/80 bg-slate-950/70 text-xs">
          <div className="p-4 border-r border-slate-800/80">
            <span className="text-slate-500 block text-[11px]">Total Registered Responders</span>
            <span className="text-lg font-bold font-mono text-white tabular-nums">{volunteers.length}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Vetted civil defense roster</span>
          </div>

          <div className="p-4 border-r border-slate-800/80">
            <span className="text-slate-500 block text-[11px]">Active in Field</span>
            <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">{deployedCount}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Deployed across sectors</span>
          </div>

          <div className="p-4 border-r border-slate-800/80">
            <span className="text-slate-500 block text-[11px]">Available on Standby</span>
            <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">{availableCount}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Ready for instant dispatch</span>
          </div>

          <div className="p-4">
            <span className="text-slate-500 block text-[11px]">Average Mobilization Latency</span>
            <span className="text-lg font-bold font-mono text-cyan-400 tabular-nums">14.2 min</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Alert to boots on ground</span>
          </div>
        </div>
      </div>

      {/* Smart Proximity Dispatch Strip */}
      <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-white">Smart Proximity Auto-Dispatch</h4>
            <p className="text-slate-400 text-[11px]">
              Automatically match highest-priority incident with nearest available certified responders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={batchDispatchIncidentId}
            onChange={(e) => setBatchDispatchIncidentId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="">Select Target Disaster Incident...</option>
            {incidents.filter(i => i.status === 'ACTIVE').map(i => (
              <option key={i.id} value={i.id}>{i.code}: {i.title.slice(0, 35)}...</option>
            ))}
          </select>

          <button
            onClick={handleSmartBatchDispatch}
            disabled={!batchDispatchIncidentId || availableCount === 0}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            Auto-Dispatch 3 Squads
          </button>
        </div>
      </div>

      {batchSuccessMsg && (
        <div className="p-3 bg-emerald-900/60 border border-emerald-600 text-emerald-200 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{batchSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search responders by name, badge, or credential..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
            />
          </div>

          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Specialties</option>
            <option value="SEARCH_AND_RESCUE">Search & Rescue</option>
            <option value="PARAMEDIC_EMT">Paramedic / EMT</option>
            <option value="WATER_RESCUE_BOAT">Water Rescue Boat</option>
            <option value="HEAVY_EQUIPMENT">Heavy Equipment</option>
            <option value="DRONE_RECON">Drone Recon</option>
            <option value="LOGISTICS_DRIVER">Logistics Driver</option>
            <option value="COMMUNICATIONS_RADIO">Radio Comms</option>
          </select>
        </div>

        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({volunteers.length})
          </button>
          <button
            onClick={() => setStatusFilter('AVAILABLE')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Available ({availableCount})
          </button>
          <button
            onClick={() => setStatusFilter('DEPLOYED')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'DEPLOYED' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Deployed ({deployedCount})
          </button>
        </div>
      </div>

      {/* Volunteer Responder Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVolunteers.map(vol => {
          const isDeployed = vol.status === 'DEPLOYED' || vol.status === 'IN_TRANSIT';

          return (
            <div 
              key={vol.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{vol.fullName}</h3>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      Badge: {vol.badgeNumber} · Blood: {vol.bloodType}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                    isDeployed 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isDeployed ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <span>{vol.status}</span>
                  </span>
                </div>

                {/* Primary Skill & Station */}
                <div className="space-y-1.5 my-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Award className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-medium">{vol.primarySkill.replace(/_/g, ' ')}</span>
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

                {/* Mission Assignment if Deployed */}
                {isDeployed && vol.currentIncidentName && (
                  <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] mb-3">
                    <span className="text-slate-500 block">Assigned Incident:</span>
                    <span className="text-amber-300 font-medium line-clamp-1">{vol.currentIncidentName}</span>
                  </div>
                )}

                {/* Certifications list */}
                <div className="text-[11px] text-slate-400">
                  <span className="text-slate-500 block mb-1">Certifications:</span>
                  <div className="flex flex-wrap gap-1 text-slate-300 font-mono text-[10px]">
                    {vol.certifications.map((c, i) => (
                      <span key={i} className="bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-slate-500">
                  {vol.totalMissionsCompleted} Missions
                </span>

                <div className="flex items-center gap-2">
                  {isDeployed ? (
                    <button
                      onClick={() => onUpdateVolunteerStatus(vol.id, 'AVAILABLE')}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
                    >
                      Stand Down / Recall
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setDeployingVolunteer(vol);
                        setSelectedIncidentId(incidents[0]?.id || '');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-colors flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Deploy</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deploy Single Volunteer Modal */}
      {deployingVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-white mb-1">
              Field Mobilization Order
            </h3>
            <p className="text-slate-400 mb-4">
              Deploying {deployingVolunteer.fullName} ({deployingVolunteer.badgeNumber})
            </p>

            <form onSubmit={handleExecuteDeploy} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Assign to Target Disaster Incident:
                </label>
                <select
                  value={selectedIncidentId}
                  onChange={(e) => setSelectedIncidentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  required
                >
                  {incidents.map(inc => (
                    <option key={inc.id} value={inc.id}>
                      {inc.code}: {inc.title} ({inc.location.sector})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-950/80 rounded border border-slate-800 text-slate-400 text-[11px] space-y-1">
                <div>Primary Specialty: <span className="text-white font-medium">{deployingVolunteer.primarySkill}</span></div>
                <div>Radio Callsign: <span className="font-mono text-cyan-400">TAC-VOL-{deployingVolunteer.badgeNumber}</span></div>
                <div>Emergency Contact: <span className="text-slate-300">{deployingVolunteer.phone}</span></div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeployingVolunteer(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                >
                  Issue Deployment Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register New Volunteer Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">
                Register New Emergency Responder
              </h3>
              <button 
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-white"
              >
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
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
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
                  <label className="block text-slate-300 font-medium mb-1">Email Address</label>
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
                    <option value="B_NEG">B Negative</option>
                    <option value="AB_POS">AB Positive</option>
                    <option value="AB_NEG">AB Negative</option>
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
                  <option value="COMMUNICATIONS_RADIO">Radio Communications Specialist</option>
                  <option value="TRIAGE_NURSING">Triage Nurse</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Certifications & Qualifications (comma-separated)
                </label>
                <input
                  type="text"
                  value={newCertifications}
                  onChange={(e) => setNewCertifications(e.target.value)}
                  placeholder="FEMA ICS-200, Swiftwater Tech, NREMT, HAM Extra"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Initial Staging Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Forward Staging Hub Delta"
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
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
