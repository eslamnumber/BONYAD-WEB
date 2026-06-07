import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { Notification, PaginatedNotificationsResponse } from '../schemas/notification';

export const notificationsQueryKey = () => ['notifications', 'list'] as const;

/**
 * The signed-in user's notifications. Mirrors the RN call site
 * website-bonyad/src/services/NotificationService.ts:113 — GET
 * /notifications/my-notifications. Browser calls go through `/api/proxy/*`,
 * which attaches the session token. Tolerates both a bare array and a
 * Spring-style `{ content: [...] }` page envelope.
 */
export async function getNotifications(): Promise<Notification[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.NOTIFICATIONS.MY_NOTIFICATIONS);
  return extractNotifications(data);
}

function extractNotifications(data: unknown): Notification[] {
  if (Array.isArray(data)) return data as Notification[];
  if (data && typeof data === 'object') {
    const content = (data as PaginatedNotificationsResponse).content;
    if (Array.isArray(content)) return content;
  }
  return [];
}

export function useNotifications() {
  return useQuery({
    queryKey: notificationsQueryKey(),
    queryFn: getNotifications,
    staleTime: 1000 * 60,
  });
}
