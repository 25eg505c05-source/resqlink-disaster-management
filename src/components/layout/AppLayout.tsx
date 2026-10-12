import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationCenter } from './NotificationCenter';
import { alertApi } from '../../api/dispatchApi';
import { EmergencyAlert } from '../../types/alert';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  ShieldAlert, 
  PhoneCall, 
  Users, 
  Package, 
  Warehouse, 
  Truck, 
  Radio, 
  FileText, 
  Cpu, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  Clock,
  ShieldCheck,
  User as UserIcon,
  Plus
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const { unreadCount, activeToast, dismissToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);

  useEffect(() => {
    alertApi.getAlerts().then(all => {
      setActiveAlerts(all.filter(a => a.isActive));
    });
  }, [location.pathname]);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/map', label: 'Tactical Map', icon: MapIcon },
    { to: '/incidents', label: 'Incidents', icon: ShieldAlert },
    { to: '/sos', label: 'SOS Triage', icon: PhoneCall },
    { to: '/volunteers', label: 'Volunteers', icon: Users },
    { to: '/supplies', label: 'Supplies', icon: Package },
    { to: '/warehouses', label: 'Warehouses', icon: Warehouse },
    { to: '/dispatches', label: 'Dispatches', icon: Truck },
    { to: '/alerts', label: 'Emergency Alerts', icon: Radio },
    ...(hasRole(['ADMIN']) ? [{ to: '/audit-logs', label: 'Audit Logs', icon: FileText }] : []),
    { to: '/spring-boot', label: 'Spring Boot Engine', icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Active Broadcast Alert Top Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-md z-50">
          <div className="flex items-center gap-2 max-w-5xl truncate">
            <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <span className="font-bold tracking-wide font-mono">CIVIL DEFENSE ALERT:</span>
            <span className="truncate">{activeAlerts[0].title} — {activeAlerts[0].description}</span>
          </div>
          <button
            onClick={() => navigate('/alerts')}
            className="text-[11px] underline font-mono ml-4 shrink-0 hover:text-rose-100"
          >
            Details
          </button>
        </div>
      )}

      {/* Floating Real-time Toast if incoming emergency event */}
      {activeToast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-slate-900 border border-rose-500 rounded-xl p-4 shadow-2xl animate-bounce-short">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-[11px] font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>{activeToast.title}</span>
            </div>
            <button onClick={dismissToast} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{activeToast.message}</p>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <NavLink to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-black text-white text-base shadow-sm">
              R
            </div>
            <span className="text-base font-bold tracking-tight text-white font-sans">
              ResQLink
            </span>
          </NavLink>

          <div className="hidden lg:flex items-center gap-2 ml-4 text-xs font-mono text-slate-500">
            <span>|</span>
            <span className="text-slate-400">OPERATIONS EOC</span>
            <span>·</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
            title="Emergency Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950" />
            )}
          </button>

          {/* User Badge */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white truncate max-w-[140px]">
                  {user.fullName}
                </div>
                <div className="text-[10px] font-mono text-cyan-400">
                  {user.role} {user.badgeNumber ? `· ${user.badgeNumber}` : ''}
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-16 left-0 z-30 w-64 bg-slate-950/95 border-r border-slate-800 flex flex-col justify-between p-3 transition-transform duration-200 md:static md:translate-x-0 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
              OPERATIONS NAVIGATION
            </div>

            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Sidebar Footer info */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 rounded-lg text-[11px] font-mono text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>BACKEND API:</span>
              <span className="text-emerald-400">SPRING BOOT 3.3</span>
            </div>
            <div className="flex justify-between">
              <span>DATABASE:</span>
              <span className="text-slate-400">POSTGRESQL</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>

      <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </div>
  );
};
