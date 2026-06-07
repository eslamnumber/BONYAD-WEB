'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import type { ChatRoom } from '../schemas/chat';

import { ChatFilterTabs, type ChatFilter } from './chat-filter-tabs';
import { ChatListItem } from './chat-list-item';
import { ChatSearchBar } from './chat-search-bar';

type Props = {
  rooms: ChatRoom[];
  selectedRoomId: string | null;
  onSelect: (roomId: string) => void;
  className?: string;
};

/**
 * Conversation list panel (Figma 1046:7425) — search, read/unread filter, and
 * the scrollable conversation list filtered by both. Backed by `useMyChats`
 * (fetched in `ChatWorkspace`). `className` carries the master-detail show/hide.
 */
export function ChatListPanel({ rooms, selectedRoomId, onSelect, className }: Props) {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ChatFilter>('all');

  const filtered = useMemo(() => filterRooms(rooms, filter, query), [rooms, filter, query]);

  return (
    <aside
      aria-label={t('messages.listAriaLabel')}
      className={`bg-background border-chat-border w-full shrink-0 flex-col lg:w-80 lg:border-s ${className ?? 'flex'}`}
    >
      <ChatSearchBar value={query} onChange={setQuery} />
      <ChatFilterTabs value={filter} onChange={setFilter} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-chat-muted p-4 text-center text-sm">{t('messages.noResults')}</p>
        ) : (
          filtered.map((room) => (
            <ChatListItem
              key={room.roomId}
              room={room}
              isSelected={room.roomId === selectedRoomId}
              locale={locale}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function filterRooms(rooms: ChatRoom[], filter: ChatFilter, query: string): ChatRoom[] {
  const needle = query.trim().toLowerCase();
  return rooms.filter((room) => {
    const unread = (room.unreadCount ?? 0) > 0;
    if (filter === 'unread' && !unread) return false;
    if (filter === 'read' && unread) return false;
    if (needle && !(room.otherUserName ?? '').toLowerCase().includes(needle)) return false;
    return true;
  });
}
