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
  experienceYears: number;
}

export interface MatchScoreResult {
  volunteer: Volunteer;
  matchScore: number;
  matchingSkills: VolunteerSkill[];
  isAvailable: boolean;
  approxDistanceKm: number;
  recommendationTag: 'HIGHLY_RECOMMENDED' | 'QUALIFIED' | 'BACKUP';
}
