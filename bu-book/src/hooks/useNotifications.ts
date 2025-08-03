import { useState, useCallback } from 'react';

export interface NotificationData {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: NotificationData = {
      ...notification,
      id
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showPastTimeError = useCallback(() => {
    addNotification({
      type: 'error',
      title: 'You Cannot Book Room From The Past',
      message: 'Please select a future date and time based on Eastern Time.',
      duration: 4000
    });
  }, [addNotification]);

  const showSuccess = useCallback((message: string) => {
    addNotification({
      type: 'success',
      title: 'Success',
      message,
      duration: 3000
    });
  }, [addNotification]);

  const showError = useCallback((message: string) => {
    addNotification({
      type: 'error',
      title: 'Error',
      message,
      duration: 5000
    });
  }, [addNotification]);

  const showWarning = useCallback((message: string) => {
    addNotification({
      type: 'warning',
      title: 'Warning',
      message,
      duration: 4000
    });
  }, [addNotification]);

  const showInfo = useCallback((message: string) => {
    addNotification({
      type: 'info',
      title: 'Information',
      message,
      duration: 3000
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showPastTimeError,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}
