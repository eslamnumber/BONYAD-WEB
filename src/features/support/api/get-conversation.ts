import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { conversationQueryKey } from '../lib/conversation-format';
import { type ConversationListBody, type ConversationMessage } from '../schemas/conversation';

/**
 * Message history for a support conversation room. Mirrors GET /chat/room/:roomId/messages
 * (the same endpoint the web messages feature uses). Permissive: bare array or `{ data }` /
 * `{ messages }` envelope (rule 1).
 */
export async function getConversation(roomId: string): Promise<ConversationMessage[]> {
  const data = await apiClient.get<ConversationListBody>(
    API_ENDPOINTS.CHAT.MESSAGES.replace(':roomId', encodeURIComponent(roomId)),
  );
  if (Array.isArray(data)) return data;
  return data.data ?? data.messages ?? [];
}

/** Fetches only while a room is selected (the conversation modal is open). */
export function useConversationMessages(roomId: string | null) {
  return useQuery({
    queryKey: conversationQueryKey(roomId ?? ''),
    queryFn: () => getConversation(roomId as string),
    enabled: roomId !== null,
    staleTime: 1000 * 10,
  });
}
