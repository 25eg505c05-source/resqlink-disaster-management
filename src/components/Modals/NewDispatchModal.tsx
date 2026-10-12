import React, { useState } from 'react';
import { 
  Warehouse, 
  DisasterIncident, 
  SupplyItem, 
  Volunteer, 
  TransportType, 
  IncidentSeverity,
  DispatchMission,
  CargoItem
} from '../../types/disaster';
import { Truck, Plus, Trash2, X, Send, AlertTriangle } from 'lucide-react';

interface NewDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouses: Warehouse[];
  incidents: DisasterIncident[];
  supplies: SupplyItem[];
  volunteers: Volunteer[];
  preselectedIncidentId?: string;
  onLaunchDispatch: (dispatch: Omit<DispatchMission, 'id' | 'code' | 'progressPercent' | 'departureTime'>) => void;
}

export default function NewDispatchModal({
  isOpen,
  onClose,
  warehouses,
  incidents,
  supplies,
  volunteers,
  preselectedIncidentId,
  onLaunchDispatch,
}: NewDispatchModalProps) {
  if (!isOpen) return null;

  const [incidentId, setIncidentId] = useState<string>(
    preselectedIncidentId || (incidents[0]?.id || '')
  );
  const [warehouseId, setWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [transportType, setTransportType] = useState<TransportType>('HEAVY_TRUCK');
  const [carrierIdentifier, setCarrierIdentifier] = useState('Kenworth T880 Semi Convoy #12');
  const [driverOrPilot, setDriverOrPilot] = useState('Sgt. Marcus Holloway');
  const [priority, setPriority] = useState<IncidentSeverity>('CRITICAL');

  // Cargo builder
  const [selectedSupplyId, setSelectedSupplyId] = useState<string>(supplies[0]?.id || '');
  const [cargoQuantity, setCargoQuantity] = useState<number>(250);
  const [cargoList, setCargoList] = useState<CargoItem[]>([]);

  // Escort volunteers
  const [selectedVolunteerIds, setSelectedVolunteerIds] = useState<string[]>([]);

  const warehouseSupplies = supplies.filter(s => s.warehouseId === warehouseId);
  const availableVolunteers = volunteers.filter(v => v.status === 'AVAILABLE');

  const handleAddCargo = () => {
    const supply = supplies.find(s => s.id === selectedSupplyId);
    if (!supply || cargoQuantity <= 0) return;

    // Check if already in list
    const existingIndex = cargoList.findIndex(c => c.supplyItemId === supply.id);
    if (existingIndex >= 0) {
      const updated = [...cargoList];
      updated[existingIndex].quantity += cargoQuantity;
      setCargoList(updated);
    } else {
      setCargoList([
        ...cargoList,
        {
          supplyItemId: supply.id,
          supplyName: supply.name,
          quantity: cargoQuantity,
          unit: supply.unit,
        },
      ]);
    }
  };

  const handleRemoveCargo = (index: number) => {
    setCargoList(cargoList.filter((_, i) => i !== index));
  };

  const toggleVolunteer = (id: string) => {
    if (selectedVolunteerIds.includes(id)) {
      setSelectedVolunteerIds(selectedVolunteerIds.filter(v => v !== id));
    } else {
      setSelectedVolunteerIds([...selectedVolunteerIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inc = incidents.find(i => i.id === incidentId);
    const wh = warehouses.find(w => w.id === warehouseId);
    if (!inc || !wh) return;

    // Default cargo if none selected
    const finalCargo = cargoList.length > 0 ? cargoList : [
      {
        supplyItemId: supplies[0].id,
        supplyName: supplies[0].name,
        quantity: 150,
        unit: supplies[0].unit,
      }
    ];

    onLaunchDispatch({
      incidentId: inc.id,
      incidentTitle: inc.title,
      originWarehouseId: wh.id,
      originWarehouseName: wh.name,
      transportType,
      carrierIdentifier,
      driverOrPilot,
      status: 'EN_ROUTE',
      estimatedArrival: new Date(Date.now() + 45 * 60000).toISOString(),
      cargo: finalCargo,
      escortVolunteerIds: selectedVolunteerIds,
      currentGps: {
        lat: wh.lat + (Math.random() - 0.5) * 0.02,
        lng: wh.lng + (Math.random() - 0.5) * 0.02,
      },
      priority,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl text-xs max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-white">
              Launch Relief Supply Convoy Mission
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Incident & Origin Warehouse */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Destination Disaster Incident:
              </label>
              <select
                value={incidentId}
                onChange={(e) => setIncidentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                required
              >
                {incidents.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.code}: {i.title.slice(0, 36)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Origin Logistics Depot:
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                required
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transport & Carrier specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Transport Vehicle Type</label>
              <select
                value={transportType}
                onChange={(e) => setTransportType(e.target.value as TransportType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
              >
                <option value="HEAVY_TRUCK">Heavy Logistics Semi</option>
                <option value="AMPHIBIOUS_UNIMOG">Amphibious Unimog 4x4</option>
                <option value="CARGO_AIRCRAFT">Cargo C-130 Hercules</option>
                <option value="RESCUE_BOAT">Swift Rescue Zodiac Boat</option>
                <option value="CARGO_DRONE">Heavy Cargo Drone UAV</option>
                <option value="LIGHT_VAN">Rapid Response Van</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Carrier Identifier / Fleet #</label>
              <input
                type="text"
                required
                value={carrierIdentifier}
                onChange={(e) => setCarrierIdentifier(e.target.value)}
                placeholder="e.g. Unimog Unit #3"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Lead Driver / Pilot</label>
              <input
                type="text"
                required
                value={driverOrPilot}
                onChange={(e) => setDriverOrPilot(e.target.value)}
                placeholder="e.g. Capt. Sarah Jenkins"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Cargo Manifest Builder */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Relief Cargo Manifest</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {cargoList.length} Items Loaded
              </span>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedSupplyId}
                onChange={(e) => setSelectedSupplyId(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none"
              >
                {supplies.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.currentStock} {s.unit} in stock)
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={cargoQuantity}
                onChange={(e) => setCargoQuantity(Number(e.target.value))}
                placeholder="Qty"
                className="w-24 bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded-lg px-2.5 py-2"
              />

              <button
                type="button"
                onClick={handleAddCargo}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Current manifest table */}
            {cargoList.length > 0 ? (
              <div className="divide-y divide-slate-800/80 max-h-32 overflow-y-auto">
                {cargoList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 text-[11px]">
                    <span className="text-slate-300">{item.supplyName}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-cyan-400 font-semibold">
                        {item.quantity.toLocaleString()} {item.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCargo(idx)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">
                Add supplies above to compile the flight/cargo manifest.
              </p>
            )}
          </div>

          {/* Volunteer Escort Selection */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Assign Escort Responders / SAR Crew:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
              {availableVolunteers.map(vol => {
                const isSelected = selectedVolunteerIds.includes(vol.id);
                return (
                  <button
                    key={vol.id}
                    type="button"
                    onClick={() => toggleVolunteer(vol.id)}
                    className={`p-2 rounded border text-left transition-colors ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold truncate">{vol.fullName}</div>
                    <div className="font-mono text-[10px] text-slate-500">{vol.primarySkill.replace(/_/g, ' ')}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
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
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Launch Convoy Mission</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
