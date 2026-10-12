import { apiClient } from './client';
import { AuthResponse, LoginCredentials, RegisterPayload, User } from '../types/auth';
import { dataStore } from '../services/dataStore';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch {
      // Fallback to dataStore
      return dataStore.login(credentials);
    }
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', payload);
      return response.data;
    } catch {
      return dataStore.register(payload);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const raw = localStorage.getItem('resqlink_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('resqlink_token');
    localStorage.removeItem('resqlink_user');
  },
};
