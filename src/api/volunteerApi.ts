import { apiClient } from './client';
import { Volunteer, MatchScoreResult } from '../types/volunteer';
import { Incident } from '../types/incident';
import { User } from '../types/auth';
import { dataStore } from '../services/dataStore';

export const volunteerApi = {
  async getVolunteers(): Promise<Volunteer[]> {
    try {
      const response = await apiClient.get<Volunteer[]>('/volunteers');
      return response.data;
    } catch {
      return dataStore.getVolunteers();
    }
  },

  async registerVolunteer(data: Partial<Volunteer>, user: User): Promise<Volunteer> {
    try {
      const response = await apiClient.post<Volunteer>('/volunteers', data);
      return response.data;
    } catch {
      return dataStore.registerVolunteer(data, user);
    }
  },

  async updateVolunteerStatus(
    id: string, 
    status: Volunteer['status'], 
    incidentId?: string, 
    incidentTitle?: string, 
    user?: User
  ): Promise<Volunteer> {
    try {
      const response = await apiClient.put<Volunteer>(`/volunteers/${id}/status`, {
        status,
        incidentId,
        incidentTitle,
      });
      return response.data;
    } catch {
      return dataStore.updateVolunteerStatus(id, status, incidentId, incidentTitle, user);
    }
  },

  getSmartMatches(incident: Incident, requiredSkills: string[]): MatchScoreResult[] {
    return dataStore.findSmartMatches(incident, requiredSkills);
  },
};
