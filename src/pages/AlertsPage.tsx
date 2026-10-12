import React, { useState, useEffect } from 'react';
import { alertApi } from '../api/dispatchApi';
import { EmergencyAlert, AlertType, CommunicationChannel } from '../types/alert';
import { IncidentSeverity } from '../types/incident';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import BroadcastAlertModal from '../components/Modals/BroadcastAlertModal';
import { 
  Radio, 
  Search, 
  Plus, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  X, 
  Wifi, 
  Volume2, 
  ShieldAlert 
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await alertApi.getAlerts();
      setAlerts(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleExpire = async (id: string) => {
    if (!user) return;
    await alertApi.expireAlert(id, user);
    loadAlerts();
  };

  const handleBroadcastSent = async (message: string) => {
    if (!user) return;
    await alertApi.createAlert({
      title: 'CIVIL DEFENSE MANDATORY EVACUATION',
      description: message,
      type: 'EVACUATION',
      severity: 'CRITICAL',
      targetSector: 'Sector 4 - Lower Coastal Delta',
    }, user);
    loadAlerts();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Emergency Civil Defense Alerts
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            WIRELESS EMERGENCY ALERTS (WEA) · EAS NOAA RADIO · FIRSTNET
          </p>
        </div>

        {hasRole(['ADMIN', 'COORDINATOR']) && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Broadcast Emergency Alert</span>
          </button>
        )}
      </div>

      {/* Active Alerts Showcase */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
          ACTIVE REGIONAL BROADCASTS ({alerts.filter(a => a.isActive).length})
        </h3>

        {alerts.filter(a => a.isActive).map(alert => (
          <div key={alert.id} className="p-4 rounded-xl border border-rose-800 bg-rose-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-mono text-rose-400 font-bold text-xs">{alert.type}</span>
                <span className="text-slate-600">·</span>
                <span className="font-mono text-slate-400 text-[11px]">{alert.targetSector}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{alert.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>
              <div className="text-[10px] font-mono text-slate-500 pt-1">
                Issued by {alert.createdByUserName} · Valid until {new Date(alert.endTime).toLocaleTimeString()}
              </div>
            </div>

            {hasRole(['ADMIN', 'COORDINATOR']) && (
              <button
                onClick={() => handleExpire(alert.id)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-xs transition-colors shrink-0"
              >
                Expire Broadcast
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Historical Alerts Archive */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
          BROADCAST ALERT ARCHIVE & LOGS
        </h3>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          {isLoading ? (
            <TableSkeleton rows={3} cols={5} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                    <th className="py-3 px-4 font-semibold">Type</th>
                    <th className="py-3 px-4 font-semibold">Title & Sector</th>
                    <th className="py-3 px-4 font-semibold">Channels</th>
                    <th className="py-3 px-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {alerts.map(a => (
                    <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {new Date(a.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={a.type} />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{a.title}</div>
                        <div className="text-[11px] font-mono text-slate-500">{a.targetSector}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {a.channels.join(', ')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`font-mono text-[11px] font-semibold ${
                          a.isActive ? 'text-rose-400' : 'text-slate-500'
                        }`}>
                          {a.isActive ? 'BROADCASTING' : 'EXPIRED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <BroadcastAlertModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onBroadcastSent={handleBroadcastSent}
      />
    </div>
  );
};
