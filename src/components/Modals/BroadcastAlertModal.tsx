import React, { useState } from 'react';
import { Radio, AlertTriangle, X, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface BroadcastAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcastSent: (message: string) => void;
}

export default function BroadcastAlertModal({
  isOpen,
  onClose,
  onBroadcastSent,
}: BroadcastAlertModalProps) {
  if (!isOpen) return null;

  const [targetSector, setTargetSector] = useState('ALL_SECTORS');
  const [alertType, setAlertType] = useState('EVACUATION_MANDATORY');
  const [headline, setHeadline] = useState('MANDATORY EVACUATION: LEVEE OVERTOPPING IN SECTOR 4');
  const [instructions, setInstructions] = useState(
    'All residents east of Grand Pass must move to high ground immediately. Civic Superdome Mass Shelter open with food, water, and medical aid.'
  );
  const [broadcastChannels, setBroadcastChannels] = useState({
    cellularWEA: true,
    easRadio: true,
    sirenNetwork: true,
    firstNetPager: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBroadcastSent(`[${alertType}] ${headline} — Broadcast to ${targetSector}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-rose-800 rounded-xl p-6 shadow-2xl text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2 text-rose-500">
            <Radio className="w-5 h-5 animate-pulse" />
            <h3 className="text-base font-bold text-white">
              Civil Defense Emergency Alert Broadcast
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Geographic Sector</label>
              <select
                value={targetSector}
                onChange={(e) => setTargetSector(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
              >
                <option value="ALL_SECTORS">All Regional Sectors (Broadcast All)</option>
                <option value="Sector 4 - Lower Coastal Delta">Sector 4 - Lower Coastal Delta</option>
                <option value="Sector 2 - Central Metro">Sector 2 - Central Metro</option>
                <option value="Sector 3 - Waterfront Industrial">Sector 3 - Waterfront Industrial</option>
                <option value="Sector 1 - Evacuation Zone A">Sector 1 - Evacuation Zone A</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Alert Classification</label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-rose-400 font-mono text-xs focus:outline-none"
              >
                <option value="EVACUATION_MANDATORY">Mandatory Immediate Evacuation</option>
                <option value="SHELTER_IN_PLACE">Shelter In Place (High Winds)</option>
                <option value="BOIL_WATER_NOTICE">Potable Water Contamination Notice</option>
                <option value="CURFEW_ORDER">Emergency Logistics Curfew Order</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Urgent Alert Headline (WEA 90-char)</label>
            <input
              type="text"
              required
              maxLength={90}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Public Action Instructions</label>
            <textarea
              rows={3}
              required
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-2 font-mono uppercase">
              Broadcast Channels Activated:
            </label>
            <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-2 rounded border border-slate-800">
                <input
                  type="checkbox"
                  checked={broadcastChannels.cellularWEA}
                  onChange={(e) => setBroadcastChannels({ ...broadcastChannels, cellularWEA: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-rose-600 focus:ring-0"
                />
                <span>Wireless Emergency Alerts (Cell)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-2 rounded border border-slate-800">
                <input
                  type="checkbox"
                  checked={broadcastChannels.easRadio}
                  onChange={(e) => setBroadcastChannels({ ...broadcastChannels, easRadio: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-rose-600 focus:ring-0"
                />
                <span>NOAA Weather Radio / EAS FM</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-2 rounded border border-slate-800">
                <input
                  type="checkbox"
                  checked={broadcastChannels.firstNetPager}
                  onChange={(e) => setBroadcastChannels({ ...broadcastChannels, firstNetPager: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-rose-600 focus:ring-0"
                />
                <span>FirstNet Field Pager Broadcast</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-2 rounded border border-slate-800">
                <input
                  type="checkbox"
                  checked={broadcastChannels.sirenNetwork}
                  onChange={(e) => setBroadcastChannels({ ...broadcastChannels, sirenNetwork: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-rose-600 focus:ring-0"
                />
                <span>Municipal Flood Siren Network</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Immediate Alert</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
