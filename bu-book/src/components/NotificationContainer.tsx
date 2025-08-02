import Notification from './Notification';
import type { NotificationData } from '../hooks/useNotifications';

interface NotificationContainerProps {
  notifications: NotificationData[];
  onRemoveNotification: (id: string) => void;
}

export default function NotificationContainer({
  notifications,
  onRemoveNotification
}: NotificationContainerProps) {
  return (
    <>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          duration={notification.duration}
          onClose={() => onRemoveNotification(notification.id)}
        />
      ))}
    </>
  );
}
