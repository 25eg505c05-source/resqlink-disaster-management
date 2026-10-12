import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, Check, ExternalLink, X, ShieldAlert, HeartPulse, Truck, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleItemClick = (n: typeof notifications[0]) => {
    markRead(n.id);
    if (n.link) {
      navigate(n.link);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-slideLeft">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-rose-500" />
            <h3 className="font-semibold text-white text-xs uppercase tracking-wider font-mono">
              OPERATION ALERTS ({unreadCount})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-mono"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Mark All</span>
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No active notifications
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`p-3.5 text-xs transition-colors cursor-pointer hover:bg-slate-800/50 ${
                  !n.read ? 'bg-slate-950/60 border-l-2 border-rose-500' : 'opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-mono text-[10px] font-bold ${
                    n.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {n.type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="font-semibold text-white text-xs mb-0.5">{n.title}</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                  {n.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
