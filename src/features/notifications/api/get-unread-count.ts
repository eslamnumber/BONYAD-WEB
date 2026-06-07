import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

export const unreadCountQueryKey = () => ['notifications', 'unread-count'] as const;

/**
 * Unread-notification count for the bell badge. Mirrors RN endpoint
 * NOTIFICATIONS.UNREAD_COUNT (GET /notifications/unread-count). Permissive on the
 * envelope shape — the backend may return a bare number, `{ count }`, or
 * `{ unreadCount }`.
 */
export async function getUnreadCount(): Promise<number> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
  return extractCount(data);
}

function extractCount(data: unknown): number {
  if (typeof data === 'number') return data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj.count === 'number') return obj.count;
    if (typeof obj.unreadCount === 'number') return obj.unreadCount;
  }
  return 0;
}

export function useUnreadCount() {
  return useQuery({
    queryKey: unreadCountQueryKey(),
    queryFn: getUnreadCount,
    staleTime: 1000 * 60,
  });
}
