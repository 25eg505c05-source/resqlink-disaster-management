import React, { useState, useEffect } from 'react';
import { incidentApi } from '../api/incidentApi';
import { sosApi } from '../api/sosApi';
import { volunteerApi } from '../api/volunteerApi';
import { supplyApi, warehouseApi } from '../api/supplyApi';
import { dispatchApi } from '../api/dispatchApi';
import { Incident } from '../types/incident';
import { SosTicket } from '../types/sos';
import { Volunteer } from '../types/volunteer';
import { SupplyItem, Warehouse } from '../types/supply';
import { DispatchMission } from '../types/dispatch';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  ShieldAlert, 
  PhoneCall, 
  Users, 
  Truck, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  ArrowUpRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sosTickets, setSosTickets] = useState<SosTicket[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [dispatches, setDispatches] = useState<DispatchMission[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incResp, sosResp, volResp, supResp, whResp, dispResp] = await Promise.all([
          incidentApi.getIncidents(),
          sosApi.getSosTickets(),
          volunteerApi.getVolunteers(),
          supplyApi.getSupplies(),
          warehouseApi.getWarehouses(),
          dispatchApi.getDispatches(),
        ]);
        setIncidents(incResp.items);
        setSosTickets(sosResp);
        setVolunteers(volResp);
        setSupplies(supResp);
        setWarehouses(whResp);
        setDispatches(dispResp);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton count={4} />
        <CardSkeleton count={4} />
      </div>
    );
  }

  // KPI Calculations
  const activeIncidents = incidents.filter(i => i.status === 'ACTIVE').length;
  const criticalIncidents = incidents.filter(i => i.severity === 'CRITICAL' && i.status === 'ACTIVE').length;
  const pendingSos = sosTickets.filter(s => s.status === 'PENDING').length;
  const availableResponders = volunteers.filter(v => v.status === 'AVAILABLE').length;
  const activeDispatches = dispatches.filter(d => d.status === 'EN_ROUTE' || d.status === 'DELIVERING' || d.status === 'STAGING').length;
  const lowStockItems = supplies.filter(s => s.status === 'LOW_STOCK').length;
  const criticalStockItems = supplies.filter(s => s.status === 'CRITICAL' || s.status === 'OUT_OF_STOCK').length;
  const completedMissions = dispatches.filter(d => d.status === 'COMPLETED').length + 18;

  // Chart Data: Incidents by Severity
  const severityChartData = [
    { name: 'Critical', count: incidents.filter(i => i.severity === 'CRITICAL').length, color: '#f43f5e' },
    { name: 'High', count: incidents.filter(i => i.severity === 'HIGH').length, color: '#f59e0b' },
    { name: 'Medium', count: incidents.filter(i => i.severity === 'MEDIUM').length, color: '#38bdf8' },
    { name: 'Low', count: incidents.filter(i => i.severity === 'LOW').length, color: '#10b981' },
  ];

  // Chart Data: Incidents by Disaster Type
  const typeChartData = [
    { type: 'Hurricane', count: incidents.filter(i => i.type === 'HURRICANE').length },
    { type: 'Flash Flood', count: incidents.filter(i => i.type === 'FLASH_FLOOD').length },
    { type: 'Collapse', count: incidents.filter(i => i.type === 'STRUCTURAL_COLLAPSE').length },
    { type: 'Medical', count: incidents.filter(i => i.type === 'MEDICAL_SURGE').length },
  ];

  // Chart Data: SOS Status
  const sosChartData = [
    { name: 'Pending', value: sosTickets.filter(s => s.status === 'PENDING').length, color: '#f59e0b' },
    { name: 'Triaged', value: sosTickets.filter(s => s.status === 'TRIAGED').length, color: '#a855f7' },
    { name: 'Dispatched', value: sosTickets.filter(s => s.status === 'DISPATCHED').length, color: '#06b6d4' },
    { name: 'Resolved', value: sosTickets.filter(s => s.status === 'RESOLVED').length, color: '#10b981' },
  ];

  // Response time trend (mock trend minutes)
  const responseTrendData = [
    { time: '02:00', minutes: 22 },
    { time: '03:00', minutes: 19 },
    { time: '04:00', minutes: 14 },
    { time: '05:00', minutes: 12 },
    { time: '06:00', minutes: 11 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            EOC Tactical Command Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            SITUATION REPORT · REGIONAL CRISIS THEATER · ACTIVE HURRICANE IRIS LANDFALL
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/map')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Live GIS Map</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => navigate('/incidents')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono text-slate-400">ACTIVE INCIDENTS</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{activeIncidents}</span>
            <span className="text-[10px] text-rose-400 block mt-0.5">{criticalIncidents} Critical Severity</span>
          </div>
        </div>

        <div 
          onClick={() => navigate('/sos')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono text-slate-400">PENDING SOS CALLS</span>
            <PhoneCall className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">{pendingSos}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Awaiting Triage</span>
          </div>
        </div>

        <div 
          onClick={() => navigate('/volunteers')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono text-slate-400">AVAILABLE SQUADS</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{availableResponders}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Ready for dispatch</span>
          </div>
        </div>

        <div 
          onClick={() => navigate('/dispatches')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono text-slate-400">CONVOYS IN TRANSIT</span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">{activeDispatches}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">{completedMissions} missions complete</span>
          </div>
        </div>

        <div 
          onClick={() => navigate('/supplies')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono text-slate-400">LOW STOCK WARNINGS</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">{lowStockItems}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Below safe thresholds</span>
          </div>
        </div>

        <div 
          onClick={() => navigate('/supplies')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono text-slate-400">CRITICAL STOCK ITEMS</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-rose-400 tabular-nums">{criticalStockItems}</span>
            <span className="text-[10px] text-rose-500 block mt-0.5">Urgent resupply needed</span>
          </div>
        </div>

        <div 
          onClick={() => navigate('/dispatches')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono text-slate-400">COMPLETED MISSIONS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{completedMissions}</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">99.4% Delivery success</span>
          </div>
        </div>

        <div 
          onClick={() => navigate('/volunteers')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono text-slate-400">AVG RESPONSE LATENCY</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">11.4 min</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Triage to boots on ground</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incidents by Severity (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-400 mb-4">
            INCIDENTS BY SEVERITY
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
            <span>Critical P1: {criticalIncidents}</span>
            <span>Total Active: {activeIncidents}</span>
          </div>
        </div>

        {/* SOS Triage Breakdown (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-400 mb-4">
            SOS TRIAGE STATUS DISTRIBUTION
          </h3>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sosChartData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} paddingAngle={4}>
                  {sosChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            <span className="text-amber-400">Pending: {pendingSos}</span>
            <span className="text-cyan-400">Dispatched: 2</span>
            <span className="text-emerald-400">Resolved: 1</span>
          </div>
        </div>

        {/* Response Time Trend (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-400 mb-4">
            DISPATCH LATENCY TREND (MINUTES)
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTrendData}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="m" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                <Line type="monotone" dataKey="minutes" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
            <span>Optimal Target: &lt; 15 min</span>
            <span className="text-emerald-400">Current: 11.4 min</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Live Stream & High-Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Feed (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-white">
                LIVE INCIDENT & LOGISTICS ACTIVITY LOG
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">AUTO-REFRESHING</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-start gap-3 p-2.5 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-rose-400 font-bold shrink-0">10:32 AM</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">
                <strong className="text-white">Critical SOS-2026-8812</strong> logged: 6 victims stranded in attic at Grand Pass.
              </span>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-cyan-400 font-bold shrink-0">10:35 AM</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">
                Rescue team <strong className="text-white">Echo-1 (Zodiac fleet)</strong> dispatched from Naval Air station.
              </span>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-amber-400 font-bold shrink-0">10:42 AM</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">
                Medical supplies <strong className="text-white">MED-TRM-801</strong> reserved at Central Alpha Depot (120 kits).
              </span>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-emerald-400 font-bold shrink-0">10:51 AM</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">
                Convoy <strong className="text-white">CONVOY-TITAN-4</strong> reached 62% progress on I-10 corridor.
              </span>
            </div>
          </div>
        </div>

        {/* Tactical Overview / Active Sectors (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-white">
                  PRIORITY SECTOR STATUS
                </h3>
              </div>
              <span className="text-[10px] font-mono text-rose-400">DEFCON 2</span>
            </div>

            <div className="space-y-3 text-xs">
              {incidents.slice(0, 3).map(inc => (
                <div key={inc.id} className="p-2.5 rounded bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white truncate">{inc.title}</span>
                    <StatusBadge status={inc.severity} />
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 flex justify-between">
                    <span>{inc.location.sector}</span>
                    <span>{inc.affectedPopulation.toLocaleString()} affected</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/incidents')}
            className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View All Operational Incidents</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
