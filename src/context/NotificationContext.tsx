import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SystemNotification } from '../types/alert';
import { notificationApi } from '../api/dispatchApi';
import { websocketService } from '../services/websocketService';

interface NotificationContextType {
  notifications: SystemNotification[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
  activeToast: SystemNotification | null;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [activeToast, setActiveToast] = useState<SystemNotification | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Subscribe to live notifications via WebSocket bus
    const unsub = websocketService.subscribe('*', (event: any) => {
      if (event?.topic === 'ALERT_CREATED' || event?.topic === 'SOS_CREATED') {
        refresh();
        const payload = event.data || event.payload;
        if (payload) {
          setActiveToast({
            id: `toast-${Date.now()}`,
            type: event.topic === 'ALERT_CREATED' ? 'EMERGENCY_ALERT' : 'CRITICAL_SOS',
            title: payload.title || `Emergency: ${payload.ticketNumber || 'New Alert'}`,
            message: payload.description || payload.callerName ? `${payload.callerName} reports ${payload.victimCount} victims` : 'Immediate action required',
            severity: payload.severity || 'CRITICAL',
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
      }
    });

    return () => unsub();
  }, [refresh]);

  const markRead = async (id: string) => {
    await notificationApi.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await notificationApi.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markRead,
        markAllRead,
        refresh,
        activeToast,
        dismissToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
