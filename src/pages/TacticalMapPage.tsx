import React, { useState, useEffect } from 'react';
import DisasterMap from '../components/Map/DisasterMap';
import NewDispatchModal from '../components/Modals/NewDispatchModal';
import { incidentApi } from '../api/incidentApi';
import { dispatchApi } from '../api/dispatchApi';
import { warehouseApi, supplyApi } from '../api/supplyApi';
import { volunteerApi } from '../api/volunteerApi';
import { Incident } from '../types/incident';
import { DispatchMission } from '../types/dispatch';
import { Warehouse, SupplyItem } from '../types/supply';
import { Volunteer } from '../types/volunteer';
import { DisasterIncident } from '../types/disaster';
import { CardSkeleton } from '../components/common/LoadingSkeleton';

export const TacticalMapPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [dispatches, setDispatches] = useState<DispatchMission[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);

  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | undefined>();

  const loadData = async () => {
    try {
      const [incResp, dispResp, whResp, volResp, supResp] = await Promise.all([
        incidentApi.getIncidents(),
        dispatchApi.getDispatches(),
        warehouseApi.getWarehouses(),
        volunteerApi.getVolunteers(),
        supplyApi.getSupplies(),
      ]);
      setIncidents(incResp.items);
      setDispatches(dispResp);
      setWarehouses(whResp);
      setVolunteers(volResp);
      setSupplies(supResp);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLaunchDispatch = async (dispatchData: any) => {
    await dispatchApi.createDispatch(dispatchData, {
      id: 'usr-001',
      fullName: 'Field Commander',
      role: 'COORDINATOR',
      email: 'coordinator@resqlink.org',
      isActive: true,
      createdAt: '',
    });
    loadData();
  };

  const handleUpdateProgress = async (id: string, progress: number) => {
    await dispatchApi.updateDispatchProgress(id, progress);
    loadData();
  };

  if (isLoading) {
    return <CardSkeleton count={3} />;
  }

  // Convert Incident to DisasterIncident for DisasterMap compatibility
  const disasterIncidents: DisasterIncident[] = incidents.map(i => ({
    id: i.id,
    code: i.code,
    title: i.title,
    type: i.type as any,
    severity: i.severity as any,
    status: i.status as any,
    location: {
      lat: i.location.lat,
      lng: i.location.lng,
      sector: i.location.sector,
      address: i.location.address,
    },
    affectedPopulation: i.affectedPopulation,
    reportedAt: i.reportedAt,
    commander: i.commander,
    description: i.description,
    neededSupplies: i.requiredResources,
    assignedVolunteerIds: i.assignedVolunteerIds,
    activeDispatchIds: i.activeDispatchIds,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Tactical GIS Operations Map
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            COASTAL DELTA DISASTER THEATER · 29.95°N 90.07°W · SATELLITE RADAR ACTIVE
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedIncidentId(undefined);
            setIsDispatchModalOpen(true);
          }}
          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium transition-colors"
        >
          Launch New Convoy
        </button>
      </div>

      <DisasterMap
        incidents={disasterIncidents}
        dispatches={dispatches as any}
        warehouses={warehouses as any}
        volunteers={volunteers as any}
        onSelectIncident={(inc) => {
          setSelectedIncidentId(inc.id);
          setIsDispatchModalOpen(true);
        }}
        onOpenNewDispatch={(incId) => {
          setSelectedIncidentId(incId);
          setIsDispatchModalOpen(true);
        }}
        onUpdateDispatchProgress={handleUpdateProgress}
      />

      <NewDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        warehouses={warehouses as any}
        incidents={disasterIncidents}
        supplies={supplies as any}
        volunteers={volunteers as any}
        preselectedIncidentId={selectedIncidentId}
        onLaunchDispatch={handleLaunchDispatch}
      />
    </div>
  );
};
