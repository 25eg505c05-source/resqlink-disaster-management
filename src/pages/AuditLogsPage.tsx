import React, { useState, useEffect } from 'react';
import { auditApi } from '../api/dispatchApi';
import { AuditLog } from '../types/alert';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { exportToCsv } from '../utils/exportCsv';
import { FileText, Search, Download, ShieldCheck, User } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    auditApi.getAuditLogs().then(data => {
      setLogs(data);
      setIsLoading(false);
    });
  }, []);

  const filteredLogs = logs.filter(l => {
    const q = search.toLowerCase();
    const matchesSearch = 
      l.userName.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.entity.toLowerCase().includes(q);
    const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExportCsv = () => {
    const data = logs.map(l => ({
      Timestamp: l.timestamp,
      User: l.userName,
      Role: l.userRole,
      Action: l.action,
      Entity: l.entity,
      EntityId: l.entityId,
      Details: l.details,
      OldValue: l.oldValue || '',
      NewValue: l.newValue || '',
      IP: l.ipAddress || '',
    }));
    exportToCsv('system_audit_logs', data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            System Security & Audit Log
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            IMMUTABLE SECURITY LEDGER · ROLE-BASED ACCESS ACTION TRACKING
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by user, entity, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 font-mono"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none font-mono"
        >
          <option value="ALL">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="STATUS_CHANGE">STATUS_CHANGE</option>
          <option value="DISPATCH_LAUNCH">DISPATCH_LAUNCH</option>
          <option value="STOCK_TRANSFER">STOCK_TRANSFER</option>
          <option value="ALERT_BROADCAST">ALERT_BROADCAST</option>
          <option value="LOGIN">LOGIN</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {isLoading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">User & Role</th>
                  <th className="py-3 px-4 font-semibold">Target Entity</th>
                  <th className="py-3 px-4 font-semibold">Audit Details & Values</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 text-cyan-400">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{log.userName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{log.userRole}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                      {log.entity} #{log.entityId.slice(0, 8)}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <div>{log.details}</div>
                      {log.oldValue && log.newValue && (
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          Old: <span className="text-amber-400">{log.oldValue}</span> → New: <span className="text-emerald-400">{log.newValue}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
