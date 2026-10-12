export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'REPORTED' | 'VERIFIED' | 'ACTIVE' | 'CONTAINED' | 'RESOLVED' | 'CLOSED';
export type DisasterType = 
  | 'HURRICANE' 
  | 'FLASH_FLOOD' 
  | 'EARTHQUAKE' 
  | 'STRUCTURAL_COLLAPSE' 
  | 'WILDFIRE' 
  | 'MEDICAL_SURGE' 
  | 'HAZMAT';

export interface IncidentLocation {
  id?: string;
  sector: string;
  address: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  authorName: string;
}

export interface Incident {
  id: string;
  code: string;
  title: string;
  type: DisasterType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: IncidentLocation;
  affectedPopulation: number;
  reportedAt: string;
  updatedAt: string;
  commander: string;
  description: string;
  requiredResources: {
    category: string;
    quantity: number;
    unit: string;
  }[];
  assignedVolunteerIds: string[];
  activeDispatchIds: string[];
  relatedSosTicketIds: string[];
  timeline: IncidentTimelineEvent[];
}

export interface IncidentFilterParams {
  search?: string;
  severity?: IncidentSeverity | 'ALL';
  status?: IncidentStatus | 'ALL';
  type?: DisasterType | 'ALL';
  sector?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
