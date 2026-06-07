'use client';

import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { type Locale } from '@/types/locale';

import { formatChatTime } from '../lib/format-chat-time';
import type { ChatRoom } from '../schemas/chat';

type Props = {
  room: ChatRoom;
  isSelected: boolean;
  locale: Locale;
  onSelect: (roomId: string) => void;
};

/**
 * One conversation row (Figma 1046:7439/7446). Composes three states: selected
 * (highlighted surface), unread (leading dot + bold preview), and read (default).
 * Selected + unread can co-occur.
 */
export function ChatListItem({ room, isSelected, locale, onSelect }: Props) {
  const { t } = useTranslation();
  const name = room.otherUserName ?? '';
  const isUnread = (room.unreadCount ?? 0) > 0;
  const time = formatChatTime(room.lastMessageAt, locale, {
    now: t('messages.time.now'),
    yesterday: t('messages.time.yesterday'),
  });

  return (
    <button
      type="button"
      onClick={() => onSelect(room.roomId)}
      aria-current={isSelected ? 'true' : undefined}
      aria-label={t('messages.openConversation', { name })}
      className={`flex w-full items-center gap-3 p-3 text-start transition-colors ${
        isSelected ? 'bg-chat-item-active' : 'motion-safe:hover:bg-chat-item-active/50'
      }`}
    >
      {isUnread ? (
        <span className="bg-job-accent size-2 shrink-0 rounded-full" aria-hidden />
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-2">
          <span className="text-chat-muted shrink-0 text-xs">{time}</span>
          <span
            dir="auto"
            className="text-foreground min-w-0 flex-1 truncate text-end text-base font-medium"
          >
            {name}
          </span>
        </span>
        <span
          dir="auto"
          className={`truncate text-end text-[13px] ${
            isUnread ? 'text-sidebar-link font-semibold' : 'text-foreground/60'
          }`}
        >
          {room.lastMessage ?? ''}
        </span>
      </span>
      <Avatar name={name} src={room.otherUserProfileImage} className="size-12" />
    </button>
  );
}
