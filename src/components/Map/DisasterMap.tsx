import { useState, useId } from 'react';
import { 
  DisasterIncident, 
  DispatchMission, 
  Warehouse, 
  Volunteer 
} from '../../types/disaster';
import { 
  ShieldAlert, 
  Warehouse as WarehouseIcon, 
  Truck, 
  Users, 
  Layers, 
  Eye, 
  EyeOff, 
  Radio, 
  Navigation, 
  ChevronRight, 
  Clock, 
  Package, 
  X,
  Plus
} from 'lucide-react';

// Image asset generated for satellite radar
const RADAR_OVERLAY_IMG = '/src/assets/images/incident_satellite_radar_1791462568482.jpg';

interface DisasterMapProps {
  incidents: DisasterIncident[];
  dispatches: DispatchMission[];
  warehouses: Warehouse[];
  volunteers: Volunteer[];
  onSelectIncident: (incident: DisasterIncident) => void;
  onOpenNewDispatch: (incidentId?: string) => void;
  onUpdateDispatchProgress: (id: string, progress: number) => void;
}

export default function DisasterMap({
  incidents,
  dispatches,
  warehouses,
  volunteers,
  onSelectIncident,
  onOpenNewDispatch,
  onUpdateDispatchProgress,
}: DisasterMapProps) {
  const [showRadar, setShowRadar] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showConvoys, setShowConvoys] = useState(true);
  const [showWarehouses, setShowWarehouses] = useState(true);
  const [showVolunteers, setShowVolunteers] = useState(true);

  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'INCIDENT' | 'CONVOY' | 'WAREHOUSE' | 'VOLUNTEER';
    data: DisasterIncident | DispatchMission | Warehouse | Volunteer;
  } | null>(null);

  const radarGradientId = useId();

  // Convert GPS coordinates (around Lat 29.80-30.05, Lng -90.30 to -89.90) to SVG viewbox (0-1000, 0-600)
  const minLat = 29.80;
  const maxLat = 30.02;
  const minLng = -90.28;
  const maxLng = -89.92;

  const projectToMap = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 960 + 20;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 540 + 30;
    return { x: Math.max(25, Math.min(975, x)), y: Math.max(30, Math.min(570, y)) };
  };

  const getEntityTitle = () => {
    if (!selectedEntity) return '';
    if (selectedEntity.type === 'INCIDENT') return (selectedEntity.data as DisasterIncident).code;
    if (selectedEntity.type === 'CONVOY') return (selectedEntity.data as DispatchMission).code;
    if (selectedEntity.type === 'WAREHOUSE') return (selectedEntity.data as Warehouse).code;
    if (selectedEntity.type === 'VOLUNTEER') return (selectedEntity.data as Volunteer).fullName;
    return '';
  };

  return (
    <div className="relative w-full rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-2xl flex flex-col">
      {/* Map Header & Tactical Layer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-300 font-mono">
              TACTICAL GIS LIVE MONITOR
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-400 font-mono">
            COASTAL DELTA SECTOR 1-4 · 29.95°N 90.07°W
          </span>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowRadar(!showRadar)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              showRadar 
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' 
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Storm Radar</span>
          </button>

          <button
            onClick={() => setShowIncidents(!showIncidents)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              showIncidents 
                ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40' 
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Incidents ({incidents.length})</span>
          </button>

          <button
            onClick={() => setShowConvoys(!showConvoys)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              showConvoys 
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40' 
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Convoys ({dispatches.length})</span>
          </button>

          <button
            onClick={() => setShowWarehouses(!showWarehouses)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              showWarehouses 
                ? 'bg-sky-600/30 text-sky-300 border border-sky-500/40' 
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <WarehouseIcon className="w-3.5 h-3.5" />
            <span>Depots ({warehouses.length})</span>
          </button>

          <button
            onClick={() => setShowVolunteers(!showVolunteers)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              showVolunteers 
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' 
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Responders ({volunteers.length})</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative w-full aspect-[16/9] min-h-[460px] max-h-[640px] bg-slate-950 overflow-hidden select-none">
        {/* Background Radar Imagery Overlay */}
        {showRadar && (
          <div className="absolute inset-0 pointer-events-none opacity-35 mix-blend-screen transition-opacity duration-300">
            <img 
              src={RADAR_OVERLAY_IMG} 
              alt="Live Satellite Weather Radar" 
              className="w-full h-full object-cover filter contrast-125 saturate-150"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />
          </div>
        )}

        {/* SVG Tactical Grid and Vectors */}
        <svg 
          viewBox="0 0 1000 600" 
          className="w-full h-full absolute inset-0 cursor-crosshair"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="tacGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="2 2" />
            </pattern>
            {/* Pulsing Glow Filters */}
            <filter id="glow-rose" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f43f5e" floodOpacity="0.8" />
            </filter>
            <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.8" />
            </filter>
            <radialGradient id={radarGradientId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="80%" stopColor="#f97316" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid Background */}
          <rect width="1000" height="600" fill="url(#tacGrid)" />

          {/* Coastal Waterways & Delta Vector Contours */}
          <path
            d="M 120 40 Q 240 180, 310 240 T 480 320 T 700 390 T 940 450 L 1000 600 L 0 600 L 0 40 Z"
            fill="#081426"
            opacity="0.6"
          />
          <path
            d="M 310 240 Q 380 200, 460 210 T 640 230"
            fill="none"
            stroke="#1e3a8a"
            strokeWidth="8"
            opacity="0.4"
          />
          {/* Levee Breach Flooded Basin Area */}
          <ellipse cx="780" cy="420" rx="140" ry="85" fill={`url(#${radarGradientId})`} stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 4" />
          <text x="730" y="490" fill="#f43f5e" fontSize="10" fontFamily="JetBrains Mono" opacity="0.8">
            INUNDATION ZONE: DELTA 4
          </text>

          {/* Transit Route Polylines from Warehouses to Incidents */}
          {showConvoys && dispatches.map(disp => {
            const originWh = warehouses.find(w => w.id === disp.originWarehouseId);
            const targetInc = incidents.find(i => i.id === disp.incidentId);
            if (!originWh || !targetInc) return null;

            const p1 = projectToMap(originWh.lat, originWh.lng);
            const p2 = projectToMap(targetInc.location.lat, targetInc.location.lng);
            const curr = projectToMap(disp.currentGps.lat, disp.currentGps.lng);

            return (
              <g key={`route-${disp.id}`}>
                {/* Route Track */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.35"
                />
                {/* Active vector line to current GPS */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={curr.x}
                  y2={curr.y}
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                  opacity="0.8"
                />
              </g>
            );
          })}

          {/* Warehouses (Blue Diamonds) */}
          {showWarehouses && warehouses.map(wh => {
            const pos = projectToMap(wh.lat, wh.lng);
            const isSelected = selectedEntity?.type === 'WAREHOUSE' && selectedEntity.data.id === wh.id;

            return (
              <g 
                key={wh.id} 
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => setSelectedEntity({ type: 'WAREHOUSE', data: wh })}
              >
                <rect
                  x="-12"
                  y="-12"
                  width="24"
                  height="24"
                  transform="rotate(45)"
                  fill="#0284c7"
                  stroke={isSelected ? '#ffffff' : '#38bdf8'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                />
                <circle cx="0" cy="0" r="3" fill="#ffffff" />
                <text
                  x="16"
                  y="4"
                  fill="#e0f2fe"
                  fontSize="10"
                  fontFamily="Plus Jakarta Sans"
                  fontWeight="600"
                  className="pointer-events-none drop-shadow"
                >
                  {wh.code}
                </text>
              </g>
            );
          })}

          {/* Moving Convoys (Amber Dots with Pulsing Circles) */}
          {showConvoys && dispatches.map(disp => {
            const pos = projectToMap(disp.currentGps.lat, disp.currentGps.lng);
            const isSelected = selectedEntity?.type === 'CONVOY' && selectedEntity.data.id === disp.id;

            return (
              <g 
                key={disp.id} 
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => setSelectedEntity({ type: 'CONVOY', data: disp })}
              >
                <circle cx="0" cy="0" r="14" fill="#f59e0b" opacity="0.25" className="animate-ping" />
                <circle
                  cx="0"
                  cy="0"
                  r="9"
                  fill="#d97706"
                  stroke={isSelected ? '#ffffff' : '#fbbf24'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  filter="url(#glow-amber)"
                />
                <text x="-4" y="3" fill="#ffffff" fontSize="9" fontWeight="bold">▲</text>
                <text
                  x="12"
                  y="4"
                  fill="#fef3c7"
                  fontSize="9.5"
                  fontFamily="JetBrains Mono"
                  fontWeight="600"
                  className="pointer-events-none drop-shadow"
                >
                  {disp.code} ({disp.progressPercent}%)
                </text>
              </g>
            );
          })}

          {/* Volunteers (Green Markers) */}
          {showVolunteers && volunteers.map(vol => {
            const pos = projectToMap(vol.lat, vol.lng);
            const isSelected = selectedEntity?.type === 'VOLUNTEER' && selectedEntity.data.id === vol.id;

            return (
              <g 
                key={vol.id} 
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => setSelectedEntity({ type: 'VOLUNTEER', data: vol })}
              >
                <circle
                  cx="0"
                  cy="0"
                  r="6"
                  fill={vol.status === 'DEPLOYED' ? '#10b981' : '#64748b'}
                  stroke={isSelected ? '#ffffff' : '#34d399'}
                  strokeWidth={isSelected ? '2' : '1'}
                />
                <circle cx="0" cy="0" r="2" fill="#ffffff" />
              </g>
            );
          })}

          {/* Incidents (Pulsing Red / Amber Rings) */}
          {showIncidents && incidents.map(inc => {
            const pos = projectToMap(inc.location.lat, inc.location.lng);
            const isCritical = inc.severity === 'CRITICAL';
            const isSelected = selectedEntity?.type === 'INCIDENT' && selectedEntity.data.id === inc.id;

            return (
              <g 
                key={inc.id} 
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => {
                  setSelectedEntity({ type: 'INCIDENT', data: inc });
                  onSelectIncident(inc);
                }}
              >
                {isCritical && (
                  <circle
                    cx="0"
                    cy="0"
                    r="22"
                    fill="#f43f5e"
                    opacity="0.3"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx="0"
                  cy="0"
                  r="13"
                  fill={isCritical ? '#e11d48' : '#d97706'}
                  stroke={isSelected ? '#ffffff' : (isCritical ? '#fb7185' : '#fcd34d')}
                  strokeWidth={isSelected ? '3' : '2'}
                  filter="url(#glow-rose)"
                />
                <circle cx="0" cy="0" r="4" fill="#ffffff" />
                <text
                  x="18"
                  y="-4"
                  fill="#fff"
                  fontSize="11"
                  fontFamily="Plus Jakarta Sans"
                  fontWeight="bold"
                  className="pointer-events-none drop-shadow"
                >
                  {inc.code}
                </text>
                <text
                  x="18"
                  y="10"
                  fill="#cbd5e1"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  className="pointer-events-none drop-shadow"
                >
                  {inc.severity} · {inc.affectedPopulation.toLocaleString()} affected
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tactical Legend Box */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono text-slate-400 backdrop-blur pointer-events-none flex flex-col gap-1.5 shadow-lg">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-0.5">MAP SYMBOLOGY</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-400/40" />
            <span className="text-slate-300">Incident (Critical / Active)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-sky-500 rotate-45" />
            <span className="text-slate-300">Relief Depot / Airbase</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">Relief Convoy In-Transit</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Field Responder Squad</span>
          </div>
        </div>

        {/* Selected Entity Tactical Telemetry Drawer */}
        {selectedEntity && (
          <div className="absolute top-3 right-3 w-80 max-h-[92%] bg-slate-900/95 border border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur-md overflow-y-auto text-xs z-30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-slate-300 font-semibold uppercase">
                  {selectedEntity.type}
                </span>
                <span className="font-semibold text-slate-200 truncate">
                  {getEntityTitle()}
                </span>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                aria-label="Close telemetry drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Entity-Specific Content */}
            <div className="mt-3 space-y-3">
              {/* INCIDENT DETAILS */}
              {selectedEntity.type === 'INCIDENT' && (() => {
                const inc = selectedEntity.data as DisasterIncident;
                return (
                  <>
                    <div>
                      <h4 className="text-sm font-bold text-white">{inc.title}</h4>
                      <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">{inc.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2 bg-slate-950/60 rounded border border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Sector</span>
                        <span className="font-mono text-slate-200">{inc.location.sector}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Affected Population</span>
                        <span className="font-mono text-amber-400 font-semibold">
                          {inc.affectedPopulation.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Severity</span>
                        <span className="font-mono font-bold text-rose-400">{inc.severity}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Lead Commander</span>
                        <span className="text-slate-300 truncate block">{inc.commander}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Supplies Needed:</span>
                      <div className="space-y-1">
                        {inc.neededSupplies.map((s, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-800/40 px-2 py-1 rounded text-[11px]">
                            <span className="text-slate-300">{s.category}</span>
                            <span className="font-mono text-cyan-400">{s.quantity.toLocaleString()} {s.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenNewDispatch(inc.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg shadow-sm transition-colors mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Dispatch Relief Convoy</span>
                    </button>
                  </>
                );
              })()}

              {/* CONVOY DETAILS */}
              {selectedEntity.type === 'CONVOY' && (() => {
                const disp = selectedEntity.data as DispatchMission;
                return (
                  <>
                    <div>
                      <h4 className="text-sm font-bold text-amber-400">{disp.code}</h4>
                      <p className="text-slate-300 text-[11px]">Bound for: {disp.incidentTitle}</p>
                    </div>

                    <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Carrier:</span>
                        <span className="text-slate-200 font-medium">{disp.carrierIdentifier}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Driver/Pilot:</span>
                        <span className="text-slate-200">{disp.driverOrPilot}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Origin Depot:</span>
                        <span className="text-slate-200">{disp.originWarehouseName}</span>
                      </div>

                      {/* Progress Slider */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Transit Progress:</span>
                          <span className="font-mono font-bold text-amber-400">{disp.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${disp.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cargo manifest */}
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Manifest Cargo:</span>
                      <div className="space-y-1">
                        {disp.cargo.map((c, idx) => (
                          <div key={idx} className="flex justify-between bg-slate-800/40 px-2 py-1 rounded text-[11px]">
                            <span className="text-slate-300">{c.supplyName}</span>
                            <span className="font-mono text-emerald-400">{c.quantity.toLocaleString()} {c.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Simulate Fast Advance */}
                    <button
                      onClick={() => onUpdateDispatchProgress(disp.id, Math.min(100, disp.progressPercent + 20))}
                      className="w-full py-1.5 px-3 bg-amber-600/30 border border-amber-500/50 hover:bg-amber-600/50 text-amber-200 font-mono text-[11px] rounded transition-colors"
                    >
                      Fast-Advance Telemetry +20%
                    </button>
                  </>
                );
              })()}

              {/* WAREHOUSE DETAILS */}
              {selectedEntity.type === 'WAREHOUSE' && (() => {
                const wh = selectedEntity.data as Warehouse;
                return (
                  <>
                    <div>
                      <h4 className="text-sm font-bold text-sky-400">{wh.name}</h4>
                      <p className="text-slate-400 text-[11px]">Officer: {wh.contactOfficer} · {wh.phone}</p>
                    </div>

                    <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800 space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Total Capacity:</span>
                        <span className="font-mono text-slate-200">{wh.capacityTonnes} Tonnes</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Storage Utilization:</span>
                          <span className="font-mono text-sky-400">{wh.utilizationPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-sky-500 h-2 rounded-full"
                            style={{ width: `${wh.utilizationPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenNewDispatch()}
                      className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg transition-colors"
                    >
                      Dispatch Transport from Depot
                    </button>
                  </>
                );
              })()}

              {/* VOLUNTEER DETAILS */}
              {selectedEntity.type === 'VOLUNTEER' && (() => {
                const vol = selectedEntity.data as Volunteer;
                return (
                  <>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400">{vol.fullName}</h4>
                      <span className="text-xs font-mono text-slate-400">Badge #{vol.badgeNumber} · Blood: {vol.bloodType}</span>
                    </div>

                    <div className="p-2 bg-slate-950/60 rounded border border-slate-800 space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Primary Specialty:</span>
                        <span className="font-semibold text-emerald-400">{vol.primarySkill.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Deployment Status:</span>
                        <span className="font-mono text-slate-200 font-bold">{vol.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Station:</span>
                        <span className="text-slate-300 truncate max-w-[150px]">{vol.currentLocationName}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Certifications:</span>
                      <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                        {vol.certifications.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
