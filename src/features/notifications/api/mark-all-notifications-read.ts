'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { notificationsQueryKey } from './get-notifications';
import { unreadCountQueryKey } from './get-unread-count';

/** Mark every notification read. Mirrors RN NOTIFICATIONS.MARK_ALL_READ (POST /notifications/mark-all-read). */
export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post<unknown>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey() });
      queryClient.invalidateQueries({ queryKey: unreadCountQueryKey() });
    },
  });
}
