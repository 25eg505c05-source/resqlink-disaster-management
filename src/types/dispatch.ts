import { IncidentSeverity } from './incident';

export type TransportType = 
  | 'HEAVY_TRUCK' 
  | 'AMPHIBIOUS_UNIMOG' 
  | 'CARGO_AIRCRAFT' 
  | 'RESCUE_BOAT' 
  | 'CARGO_DRONE' 
  | 'LIGHT_VAN';

export type DispatchStatus = 
  | 'STAGING' 
  | 'READY' 
  | 'EN_ROUTE' 
  | 'ARRIVED' 
  | 'DELIVERING' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface CargoItem {
  supplyItemId: string;
  supplySku: string;
  supplyName: string;
  quantity: number;
  unit: string;
}

export interface DispatchTimelineStep {
  status: DispatchStatus;
  label: string;
  timestamp: string;
  description: string;
  completed: boolean;
}

export interface DispatchMission {
  id: string;
  code: string;
  incidentId: string;
  incidentTitle: string;
  originWarehouseId: string;
  originWarehouseName: string;
  destinationAddress: string;
  transportType: TransportType;
  carrierIdentifier: string;
  driverOrPilot: string;
  status: DispatchStatus;
  startTime: string;
  estimatedArrival: string;
  completionTime?: string;
  progressPercent: number;
  cargo: CargoItem[];
  escortVolunteerIds: string[];
  currentGps: {
    lat: number;
    lng: number;
  };
  priority: IncidentSeverity;
  timeline: DispatchTimelineStep[];
  notes?: string;
}
