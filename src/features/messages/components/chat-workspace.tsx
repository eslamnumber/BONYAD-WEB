'use client';

import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useMyChats } from '../api/get-my-chats';

import { ChatListPanel } from './chat-list-panel';
import { MainChatArea } from './main-chat-area';
import { SectionTitle } from './section-title';

type Props = {
  /** Server-rendered zero-conversations fallback (the existing empty state). */
  emptyState: ReactNode;
};

/**
 * Orchestrates the messages screen: fetches the conversation list, then renders
 * the populated two-panel chat or the empty-state fallback. Panel internals are
 * filled by the Phase 5 sub-phases (5b title, 5c list, 5d thread); selection +
 * master-detail wiring lands with those sections.
 */
export function ChatWorkspace({ emptyState }: Props) {
  const { t } = useTranslation();
  const { data: rooms, isPending, isError } = useMyChats();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  if (isPending) {
    return (
      <div
        role="status"
        aria-busy="true"
        className="flex flex-1 items-center justify-center px-4 py-16"
      >
        <span className="text-chat-muted text-sm">{t('a11y.loading')}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="flex flex-1 items-center justify-center px-4 py-16">
        <span className="text-foreground/80 text-sm">{t('errors.generic')}</span>
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return <div className="flex flex-1 items-center justify-center px-4 py-16">{emptyState}</div>;
  }

  const selectedRoom = rooms.find((room) => room.roomId === selectedRoomId) ?? null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 p-6">
      <SectionTitle />
      {/* Per Figma 1046:7379: the main chat area is the inline-start element and
          the conversation list the inline-end — so in ar (dir=ltr) the chat sits
          on the left and the list on the right, and it mirrors in en (dir=rtl). */}
      <div className="border-chat-border flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border lg:flex-row">
        <MainChatArea
          room={selectedRoom}
          onBack={() => setSelectedRoomId(null)}
          className={selectedRoom ? 'flex' : 'hidden lg:flex'}
        />
        <ChatListPanel
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          onSelect={setSelectedRoomId}
          className={selectedRoom ? 'hidden lg:flex' : 'flex'}
        />
      </div>
    </div>
  );
}
