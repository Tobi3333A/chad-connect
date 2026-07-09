import type { Notification } from '@/types';
import { CURRENT_USER_ID, mockNotifications } from '@/data/mock';
import { simulateDelay } from './api';

export async function getNotifications(): Promise<Notification[]> {
  // TODO: GET /api/notifications
  return simulateDelay(
    mockNotifications.filter((n) => n.userId === CURRENT_USER_ID),
  );
}

export async function markNotificationRead(id: string): Promise<void> {
  // TODO: PATCH /api/notifications/:id/read
  const notif = mockNotifications.find((n) => n._id === id);
  if (notif) notif.read = true;
  return simulateDelay(undefined);
}

export async function getUnreadCount(): Promise<number> {
  // TODO: GET /api/notifications/unread-count
  return simulateDelay(
    mockNotifications.filter((n) => n.userId === CURRENT_USER_ID && !n.read).length,
  );
}
