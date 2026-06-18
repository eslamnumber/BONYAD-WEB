'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { mqttChat } from '@/lib/mqtt-chat';

import { useConversationMessages, useSendConversationMessage } from '../api';
import { appendMessage, conversationQueryKey, supportRoomTopic } from '../lib/conversation-format';
import { type ConversationMessage } from '../schemas/conversation';

/**
 * Drives one support conversation: loads the message history (REST) and subscribes to
 * the room's MQTT topic so admin replies stream in live — the same realtime transport
 * the web messages feature uses (`mqttChat` singleton). Sending goes through POST
 * /chat/send; the echo arrives over MQTT, so no optimistic cache write is needed.
 */
export function useConversation(roomId: string | null, receiverId: number | null) {
  const queryClient = useQueryClient();
  const messagesQuery = useConversationMessages(roomId);
  const sendMutation = useSendConversationMessage();

  useEffect(() => {
    if (!roomId) return;
    void mqttChat.connect();
    return mqttChat.subscribe(supportRoomTopic(roomId), (data) => {
      queryClient.setQueryData<ConversationMessage[]>(conversationQueryKey(roomId), (prev) =>
        appendMessage(prev, data as ConversationMessage),
      );
    });
  }, [roomId, queryClient]);

  const send = async (text: string) => {
    if (!roomId || receiverId === null) return;
    await sendMutation.mutateAsync({ roomId, receiverId, content: text });
  };

  return {
    messages: messagesQuery.data ?? [],
    isPending: messagesQuery.isPending,
    isError: messagesQuery.isError,
    isSending: sendMutation.isPending,
    send,
  };
}
