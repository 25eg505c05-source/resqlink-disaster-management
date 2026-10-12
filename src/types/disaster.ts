export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'ACTIVE' | 'CONTAINED' | 'EVALUATING' | 'RESOLVED';
export type IncidentType = 'HURRICANE' | 'FLASH_FLOOD' | 'STRUCTURAL_COLLAPSE' | 'WILDFIRE' | 'EARTHQUAKE' | 'MEDICAL_SURGE';

export interface IncidentLocation {
  lat: number;
  lng: number;
  sector: string;
  address: string;
}

export interface DisasterIncident {
  id: string;
  code: string;
  title: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: IncidentLocation;
  affectedPopulation: number;
  reportedAt: string;
  commander: string;
  description: string;
  neededSupplies: {
    category: string;
    quantity: number;
    unit: string;
  }[];
  assignedVolunteerIds: string[];
  activeDispatchIds: string[];
}

export type SupplyCategory = 
  | 'WATER_PURIFICATION' 
  | 'FOOD_RATIONS' 
  | 'TRAUMA_MEDICAL' 
  | 'SHELTER_BEDDING' 
  | 'POWER_GENERATION' 
  | 'SEARCH_EQUIPMENT';

export interface SupplyItem {
  id: string;
  sku: string;
  name: string;
  category: SupplyCategory;
  warehouseId: string;
  warehouseName: string;
  currentStock: number;
  reservedStock: number;
  minimumThreshold: number;
  unit: string;
  unitWeightKg: number;
  batchNumber: string;
  expiryDate?: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'CRITICAL_DEPLETED';
  lastUpdated: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: 'CENTRAL_DEPOT' | 'FORWARD_STAGING_HUB' | 'AIRSTRIP_DISTRIBUTION';
  lat: number;
  lng: number;
  capacityTonnes: number;
  utilizationPercent: number;
  contactOfficer: string;
  phone: string;
}

export type VolunteerSkill = 
  | 'SEARCH_AND_RESCUE' 
  | 'PARAMEDIC_EMT' 
  | 'WATER_RESCUE_BOAT' 
  | 'HEAVY_EQUIPMENT' 
  | 'LOGISTICS_DRIVER' 
  | 'DRONE_RECON' 
  | 'COMMUNICATIONS_RADIO' 
  | 'TRIAGE_NURSING';

export type VolunteerStatus = 'AVAILABLE' | 'DEPLOYED' | 'STANDBY' | 'IN_TRANSIT' | 'RESTING';

export interface Volunteer {
  id: string;
  badgeNumber: string;
  fullName: string;
  phone: string;
  email: string;
  bloodType: string;
  primarySkill: VolunteerSkill;
  skills: VolunteerSkill[];
  status: VolunteerStatus;
  currentIncidentId?: string;
  currentIncidentName?: string;
  currentLocationName: string;
  lat: number;
  lng: number;
  assignedDispatchId?: string;
  deployedAt?: string;
  totalMissionsCompleted: number;
  certifications: string[];
}

export type TransportType = 'HEAVY_TRUCK' | 'AMPHIBIOUS_UNIMOG' | 'CARGO_AIRCRAFT' | 'RESCUE_BOAT' | 'CARGO_DRONE' | 'LIGHT_VAN';

export type DispatchStatus = 'STAGING' | 'EN_ROUTE' | 'DELIVERING' | 'COMPLETED' | 'REROUTED';

export interface CargoItem {
  supplyItemId: string;
  supplyName: string;
  quantity: number;
  unit: string;
}

export interface DispatchMission {
  id: string;
  code: string;
  incidentId: string;
  incidentTitle: string;
  originWarehouseId: string;
  originWarehouseName: string;
  transportType: TransportType;
  carrierIdentifier: string;
  driverOrPilot: string;
  status: DispatchStatus;
  departureTime: string;
  estimatedArrival: string;
  progressPercent: number;
  cargo: CargoItem[];
  escortVolunteerIds: string[];
  currentGps: {
    lat: number;
    lng: number;
  };
  priority: IncidentSeverity;
}

export interface SosTriageTicket {
  id: string;
  ticketNumber: string;
  callerName: string;
  contactNumber: string;
  sector: string;
  address: string;
  lat: number;
  lng: number;
  victimCount: number;
  requiresMedical: boolean;
  requiresEvacuation: boolean;
  waterRescueNeeded: boolean;
  severity: IncidentSeverity;
  status: 'PENDING' | 'TRIAGED' | 'DISPATCHED' | 'RESOLVED';
  timeReceived: string;
  description: string;
  allocatedDispatchId?: string;
}

export interface SystemMetrics {
  totalIncidentsActive: number;
  criticalIncidents: number;
  volunteersTotal: number;
  volunteersActiveDeployed: number;
  suppliesTotalTonnage: number;
  activeDispatches: number;
  peopleAssisted24h: number;
  burnRateHourlyTonnes: number;
}
