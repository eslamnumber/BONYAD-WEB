'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { myChatsQueryKey } from './get-my-chats';

/**
 * Mark every message in a room read. Mirrors the RN call site
 * website-bonyad/src/screens/chat/ChatDetailScreen.tsx:291 — POST
 * /chat/rooms/:roomId/mark-all-read. Called when a conversation is opened.
 */
export async function markRoomRead(roomId: string): Promise<void> {
  const path = API_ENDPOINTS.CHAT.MARK_ALL_READ.replace(':roomId', encodeURIComponent(roomId));
  await apiClient.post<unknown>(path);
}

export function useMarkRoomRead() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: markRoomRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: myChatsQueryKey() });
    },
  });
}
