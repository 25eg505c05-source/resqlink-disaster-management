import { apiClient } from './client';
import { Incident, IncidentFilterParams } from '../types/incident';
import { User } from '../types/auth';
import { dataStore } from '../services/dataStore';

export const incidentApi = {
  async getIncidents(params?: IncidentFilterParams): Promise<{ items: Incident[]; total: number }> {
    try {
      const response = await apiClient.get<{ items: Incident[]; total: number }>('/incidents', { params });
      return response.data;
    } catch {
      return dataStore.getIncidents(params);
    }
  },

  async getIncidentById(id: string): Promise<Incident | null> {
    try {
      const response = await apiClient.get<Incident>(`/incidents/${id}`);
      return response.data;
    } catch {
      return dataStore.getIncidentById(id);
    }
  },

  async createIncident(data: Partial<Incident>, user: User): Promise<Incident> {
    try {
      const response = await apiClient.post<Incident>('/incidents', data);
      return response.data;
    } catch {
      return dataStore.createIncident(data, user);
    }
  },

  async updateIncident(id: string, updates: Partial<Incident>, user: User): Promise<Incident> {
    try {
      const response = await apiClient.put<Incident>(`/incidents/${id}`, updates);
      return response.data;
    } catch {
      return dataStore.updateIncident(id, updates, user);
    }
  },

  async deleteIncident(id: string, user: User): Promise<void> {
    try {
      await apiClient.delete(`/incidents/${id}`);
    } catch {
      await dataStore.deleteIncident(id, user);
    }
  },
};
