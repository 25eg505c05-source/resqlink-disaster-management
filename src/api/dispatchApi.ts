import { apiClient } from './client';
import { DispatchMission } from '../types/dispatch';
import { EmergencyAlert, AuditLog, SystemNotification } from '../types/alert';
import { User } from '../types/auth';
import { dataStore } from '../services/dataStore';

export const dispatchApi = {
  async getDispatches(): Promise<DispatchMission[]> {
    try {
      const response = await apiClient.get<DispatchMission[]>('/dispatches');
      return response.data;
    } catch {
      return dataStore.getDispatches();
    }
  },

  async createDispatch(data: Partial<DispatchMission>, user: User): Promise<DispatchMission> {
    try {
      const response = await apiClient.post<DispatchMission>('/dispatches', data);
      return response.data;
    } catch {
      return dataStore.createDispatch(data, user);
    }
  },

  async updateDispatchProgress(id: string, progress: number, newStatus?: DispatchMission['status']): Promise<DispatchMission> {
    try {
      const response = await apiClient.put<DispatchMission>(`/dispatches/${id}/progress`, {
        progress,
        status: newStatus,
      });
      return response.data;
    } catch {
      return dataStore.updateDispatchProgress(id, progress, newStatus);
    }
  },
};

export const alertApi = {
  async getAlerts(): Promise<EmergencyAlert[]> {
    try {
      const response = await apiClient.get<EmergencyAlert[]>('/alerts');
      return response.data;
    } catch {
      return dataStore.getAlerts();
    }
  },

  async createAlert(data: Partial<EmergencyAlert>, user: User): Promise<EmergencyAlert> {
    try {
      const response = await apiClient.post<EmergencyAlert>('/alerts', data);
      return response.data;
    } catch {
      return dataStore.createAlert(data, user);
    }
  },

  async expireAlert(id: string, user: User): Promise<EmergencyAlert> {
    try {
      const response = await apiClient.put<EmergencyAlert>(`/alerts/${id}/expire`);
      return response.data;
    } catch {
      return dataStore.expireAlert(id, user);
    }
  },
};

export const auditApi = {
  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const response = await apiClient.get<AuditLog[]>('/audit-logs');
      return response.data;
    } catch {
      return dataStore.getAuditLogs();
    }
  },
};

export const notificationApi = {
  async getNotifications(): Promise<SystemNotification[]> {
    try {
      const response = await apiClient.get<SystemNotification[]>('/notifications');
      return response.data;
    } catch {
      return dataStore.getNotifications();
    }
  },

  async markRead(id: string): Promise<void> {
    try {
      await apiClient.put(`/notifications/${id}/read`);
    } catch {
      await dataStore.markNotificationRead(id);
    }
  },

  async markAllRead(): Promise<void> {
    try {
      await apiClient.put('/notifications/read-all');
    } catch {
      await dataStore.markAllNotificationsRead();
    }
  },
};
