import React from 'react';
import { Radio, Truck } from 'lucide-react';

export type ActiveTab = 'MAP' | 'SUPPLIES' | 'VOLUNTEERS' | 'TRIAGE' | 'SPRING_BOOT';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenBroadcast: () => void;
  onOpenNewDispatch: () => void;
}

export default function Navbar({
  activeTab,
  onTabChange,
  onOpenBroadcast,
  onOpenNewDispatch,
}: NavbarProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark (no adjacent subtitles/badges) */}
      <a 
        href="#" 
        onClick={(e) => { e.preventDefault(); onTabChange('MAP'); }}
        className="text-lg font-bold tracking-tight text-white whitespace-nowrap"
      >
        ResQLink
      </a>

      {/* Zone 2: 4-6 clean text navigation links with subtle hover states */}
      <nav className="hidden md:flex items-center gap-7 text-xs font-medium">
        <button
          onClick={() => onTabChange('MAP')}
          className={`transition-colors whitespace-nowrap ${
            activeTab === 'MAP'
              ? 'text-white border-b-2 border-rose-500 pb-0.5 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tactical Map
        </button>

        <button
          onClick={() => onTabChange('SUPPLIES')}
          className={`transition-colors whitespace-nowrap ${
            activeTab === 'SUPPLIES'
              ? 'text-white border-b-2 border-cyan-500 pb-0.5 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Relief Supplies
        </button>

        <button
          onClick={() => onTabChange('VOLUNTEERS')}
          className={`transition-colors whitespace-nowrap ${
            activeTab === 'VOLUNTEERS'
              ? 'text-white border-b-2 border-emerald-500 pb-0.5 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Responders
        </button>

        <button
          onClick={() => onTabChange('TRIAGE')}
          className={`transition-colors whitespace-nowrap ${
            activeTab === 'TRIAGE'
              ? 'text-white border-b-2 border-rose-500 pb-0.5 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          SOS Triage
        </button>

        <button
          onClick={() => onTabChange('SPRING_BOOT')}
          className={`transition-colors whitespace-nowrap ${
            activeTab === 'SPRING_BOOT'
              ? 'text-white border-b-2 border-indigo-500 pb-0.5 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Spring Boot Engine
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenBroadcast}
          className="px-3.5 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/60 border border-rose-800/80 rounded-lg hover:bg-rose-900/60 transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="hidden sm:inline">Broadcast Alert</span>
        </button>

        <button
          onClick={onOpenNewDispatch}
          className="px-4 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Launch Convoy</span>
        </button>
      </div>
    </header>
  );
}
