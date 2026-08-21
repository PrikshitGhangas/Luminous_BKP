'use client';

import { useState, useCallback } from 'react';
import { SystemNotification, EmergencyAlert } from '../types';
import { INITIAL_NOTIFICATIONS, INITIAL_ALERTS } from '../constants/demo-data';

export function useNotifications() {
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>(INITIAL_ALERTS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return {
    notifications,
    activeAlerts,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissAlert,
  };
}
