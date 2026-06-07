'use client';

import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { useRoomMessages } from '../api/get-room-messages';
import { useMarkRoomRead } from '../api/mark-room-read';
import { useRoomRealtime } from '../lib/use-room-realtime';
import type { ChatRoom } from '../schemas/chat';

import { ChatMessageBubble } from './chat-message-bubble';

type Props = {
  room: ChatRoom;
  currentUserId: number | undefined;
};

function ThreadNotice({ tone, children }: { tone: 'status' | 'alert'; children: ReactNode }) {
  return (
    <div
      role={tone}
      aria-busy={tone === 'status' ? true : undefined}
      className={`flex flex-1 items-center justify-center text-sm ${tone === 'status' ? 'text-chat-muted' : 'text-foreground/80'}`}
    >
      {children}
    </div>
  );
}

/**
 * Message thread (Figma 1046:7391) — fetches the room history, subscribes to the
 * live MQTT layer, marks the room read on open, renders the bubbles oldest →
 * newest, and keeps the view pinned to the latest message.
 */
export function ChatThread({ room, currentUserId }: Props) {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const { data: messages, isPending, isError } = useRoomMessages(room.roomId);
  const { mutate: markRead } = useMarkRoomRead();
  const bottomRef = useRef<HTMLDivElement>(null);

  useRoomRealtime(room.roomId, currentUserId);

  useEffect(() => {
    markRead(room.roomId);
  }, [room.roomId, markRead]);

  const sorted = useMemo(
    () =>
      [...(messages ?? [])].sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? '')),
    [messages],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [sorted.length]);

  if (isPending) return <ThreadNotice tone="status">{t('a11y.loading')}</ThreadNotice>;
  if (isError) return <ThreadNotice tone="alert">{t('errors.generic')}</ThreadNotice>;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
      {sorted.length === 0 ? (
        <p className="text-chat-muted m-auto text-center text-sm">{t('messages.threadEmpty')}</p>
      ) : (
        // `mt-auto` pins the thread to the bottom when it's short, while keeping
        // the top reachable when it overflows — `justify-end` on a scroll
        // container clips the top unscrollably.
        <div className="mt-auto flex flex-col gap-6">
          {sorted.map((message) => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              isMine={currentUserId !== undefined && message.senderId === currentUserId}
              locale={locale}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
