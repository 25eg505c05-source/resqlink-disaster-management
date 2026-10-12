import { apiClient } from './client';
import { SosTicket, PrioritySuggestion } from '../types/sos';
import { User } from '../types/auth';
import { dataStore } from '../services/dataStore';

export const sosApi = {
  async getSosTickets(): Promise<SosTicket[]> {
    try {
      const response = await apiClient.get<SosTicket[]>('/sos');
      return response.data;
    } catch {
      return dataStore.getSosTickets();
    }
  },

  async createSos(data: Partial<SosTicket>): Promise<SosTicket> {
    try {
      const response = await apiClient.post<SosTicket>('/sos', data);
      return response.data;
    } catch {
      return dataStore.createSosTicket(data);
    }
  },

  async updateSos(id: string, updates: Partial<SosTicket>, user: User): Promise<SosTicket> {
    try {
      const response = await apiClient.put<SosTicket>(`/sos/${id}`, updates);
      return response.data;
    } catch {
      return dataStore.updateSosTicket(id, updates, user);
    }
  },

  getPrioritySuggestion(ticket: Partial<SosTicket>): PrioritySuggestion {
    return dataStore.calculatePrioritySuggestion(ticket);
  },
};
