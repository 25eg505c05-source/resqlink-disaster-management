import { IncidentSeverity } from './incident';

export type SosStatus = 
  | 'PENDING' 
  | 'TRIAGED' 
  | 'ASSIGNED' 
  | 'DISPATCHED' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'CANCELLED';

export interface SosTicket {
  id: string;
  ticketNumber: string;
  incidentId?: string;
  incidentCode?: string;
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
  status: SosStatus;
  timeReceived: string;
  updatedAt: string;
  description: string;
  allocatedDispatchId?: string;
  assignedResponderIds: string[];
  operatorNotes?: string;
  resolvedAt?: string;
}

export interface PrioritySuggestion {
  calculatedSeverity: IncidentSeverity;
  score: number;
  reasons: string[];
  recommendedAction: string;
}
