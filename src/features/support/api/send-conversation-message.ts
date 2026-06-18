import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { sendConversationSchema, type SendConversationBody } from '../schemas/conversation';

/**
 * Send a message in a support conversation. Mirrors POST /chat/send with
 * `{ roomId, receiverId, content }` (the web messages send shape). Strict request (rule 1);
 * the realtime echo arrives over MQTT, so no manual cache write is needed here.
 */
export async function sendConversationMessage(input: SendConversationBody): Promise<void> {
  const body = sendConversationSchema.parse(input);
  await apiClient.post(API_ENDPOINTS.CHAT.SEND, { body });
}

export function useSendConversationMessage() {
  return useMutation<void, Error, SendConversationBody>({ mutationFn: sendConversationMessage });
}
