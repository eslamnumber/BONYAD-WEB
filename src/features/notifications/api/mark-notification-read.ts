'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { notificationsQueryKey } from './get-notifications';
import { unreadCountQueryKey } from './get-unread-count';

/** Mark a single notification read. Mirrors RN NOTIFICATIONS.MARK_READ (POST /notifications/:id/read). */
export async function markNotificationRead(id: number): Promise<void> {
  const path = API_ENDPOINTS.NOTIFICATIONS.MARK_READ.replace(':id', String(id));
  await apiClient.post<unknown>(path);
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey() });
      queryClient.invalidateQueries({ queryKey: unreadCountQueryKey() });
    },
  });
}
