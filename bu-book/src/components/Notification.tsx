import { useEffect, useState, useCallback } from 'react';
import '../assets/styles/notification.css';

export interface NotificationProps {
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  duration?: number; // Auto-dismiss time in milliseconds (0 = no auto-dismiss)
  onClose: () => void;
}

export default function Notification({
  type,
  title,
  message,
  duration = 4000,
  onClose
}: NotificationProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Wait for animation to complete before calling onClose
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '⚠️';
      case 'warning':
        return '⚡';
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`notification ${type} ${isClosing ? 'closing' : ''}`}>
      <div className="notification-icon">
        {getIcon()}
      </div>
      <div className="notification-content">
        <div className="notification-title">{title}</div>
        <div className="notification-message">{message}</div>
      </div>
      <button 
        className="notification-close"
        onClick={handleClose}
        aria-label="Close notification"
      >
        ×
      </button>
      {duration > 0 && <div className="notification-progress" />}
    </div>
  );
}
