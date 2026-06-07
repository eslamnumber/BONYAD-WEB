'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { mqttChat } from '@/lib/mqtt-chat';

import { roomMessagesQueryKey } from '../api/get-room-messages';
import { markMessageRead } from '../api/mark-message-read';
import type { ChatMessage } from '../schemas/chat';

import { chatTopics } from './chat-topics';

function appendMessage(prev: ChatMessage[] = [], message: ChatMessage): ChatMessage[] {
  return prev.some((m) => m.id === message.id) ? prev : [...prev, message];
}

function applyReceipt(prev: ChatMessage[] = [], messageId: number, isRead: boolean): ChatMessage[] {
  return prev.map((m) => (m.id === messageId ? { ...m, isRead } : m));
}

/**
 * Subscribe a mounted room to its live MQTT topics and reconcile incoming events
 * into the TanStack Query cache: new messages are appended (deduped by id), an
 * inbound message is acknowledged with `markMessageRead`, and read receipts flip
 * `isRead`. Connection is best-effort — if MQTT is unavailable the thread still
 * works over REST (the query polls), per the graceful-fallback decision.
 */
export function useRoomRealtime(roomId: string | undefined, currentUserId: number | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!roomId) return;
    void mqttChat.connect();

    const offMessage = mqttChat.subscribe(chatTopics.room(roomId), (data) => {
      const message = data as ChatMessage;
      if (typeof message.id !== 'number') return;
      queryClient.setQueryData<ChatMessage[]>(roomMessagesQueryKey(roomId), (prev) =>
        appendMessage(prev, message),
      );
      if (currentUserId !== undefined && message.senderId !== currentUserId) {
        void markMessageRead(message.id).catch(() => undefined);
      }
    });

    const offRead = mqttChat.subscribe(chatTopics.roomRead(roomId), (data) => {
      const receipt = data as { messageId?: number; isRead?: boolean };
      if (typeof receipt.messageId !== 'number') return;
      queryClient.setQueryData<ChatMessage[]>(roomMessagesQueryKey(roomId), (prev) =>
        applyReceipt(prev, receipt.messageId as number, receipt.isRead ?? true),
      );
    });

    return () => {
      offMessage();
      offRead();
    };
  }, [roomId, currentUserId, queryClient]);
}
