'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { ATTACHMENT_PLACEHOLDER } from '../lib/attachment';
import type { ChatMessage } from '../schemas/chat';
import {
  sendMessageWithFileRequestSchema,
  type SendMessageWithFileRequest,
} from '../schemas/send-message-with-file.schema';

import { myChatsQueryKey } from './get-my-chats';
import { roomMessagesQueryKey } from './get-room-messages';

/**
 * Send a message with a file attachment. Mirrors the RN call site
 * website-bonyad/src/screens/chat/ChatDetailScreen.tsx (`uploadAttachment`) —
 * POST /chat/send-with-file as multipart FormData, returns the persisted
 * message. An empty caption falls back to the `[Attachment]` placeholder so the
 * backend always receives a non-empty `content`, matching RN.
 */
export async function sendMessageWithFile(input: SendMessageWithFileRequest): Promise<ChatMessage> {
  const { receiverId, file, content, projectId } = sendMessageWithFileRequestSchema.parse(input);

  const formData = new FormData();
  formData.append('receiverId', String(receiverId));
  formData.append('content', content && content.length > 0 ? content : ATTACHMENT_PLACEHOLDER);
  if (projectId !== undefined) formData.append('projectId', String(projectId));
  formData.append('file', file, file.name);

  return apiClient.post<ChatMessage>(API_ENDPOINTS.CHAT.SEND_WITH_FILE, { body: formData });
}

/**
 * Mutation hook. Reconciles the returned message into the room's cache (deduped
 * by id, so the MQTT echo can't double it) and refreshes the conversation list.
 */
export function useSendMessageWithFile() {
  const queryClient = useQueryClient();
  return useMutation<ChatMessage, Error, SendMessageWithFileRequest>({
    mutationFn: sendMessageWithFile,
    onSuccess: (message, variables) => {
      queryClient.setQueryData<ChatMessage[]>(
        roomMessagesQueryKey(variables.roomId),
        (prev = []) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]),
      );
      void queryClient.invalidateQueries({ queryKey: myChatsQueryKey() });
    },
  });
}
