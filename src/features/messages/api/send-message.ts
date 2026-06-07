'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { ChatMessage } from '../schemas/chat';
import { sendMessageRequestSchema, type SendMessageRequest } from '../schemas/send-message.schema';

import { myChatsQueryKey } from './get-my-chats';
import { roomMessagesQueryKey } from './get-room-messages';

/**
 * Send a text message. Mirrors the RN call site
 * website-bonyad/src/screens/chat/ChatDetailScreen.tsx:265 — POST /chat/send,
 * returns the persisted message. The request body is validated strictly before
 * it leaves the client.
 */
export async function sendMessage(input: SendMessageRequest): Promise<ChatMessage> {
  const body = sendMessageRequestSchema.parse(input);
  return apiClient.post<ChatMessage>(API_ENDPOINTS.CHAT.SEND, { body });
}

/**
 * Mutation hook. Reconciles the returned message into the room's cache (deduped
 * by id, so the MQTT echo of the same message can't double it) and refreshes the
 * conversation list so its last-message / ordering update.
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation<ChatMessage, Error, SendMessageRequest>({
    mutationFn: sendMessage,
    onSuccess: (message, variables) => {
      queryClient.setQueryData<ChatMessage[]>(
        roomMessagesQueryKey(variables.roomId),
        (prev = []) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]),
      );
      void queryClient.invalidateQueries({ queryKey: myChatsQueryKey() });
    },
  });
}
