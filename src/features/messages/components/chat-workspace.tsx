'use client';

import { useSearchParams } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/stores/auth-store';

import { useMyChats } from '../api/get-my-chats';
import { resolveContactRoom } from '../lib/room-id';
import type { ChatRoom } from '../schemas/chat';

import { ChatListPanel } from './chat-list-panel';
import { MainChatArea } from './main-chat-area';
import { SectionTitle } from './section-title';

type Props = {
  /** Server-rendered zero-conversations fallback (the existing empty state). */
  emptyState: ReactNode;
};

/**
 * Orchestrates the messages screen: fetches the conversation list, then renders
 * the populated two-panel chat or the empty-state fallback. Supports a
 * `?user=<id>&name=&project=` deep-link (e.g. the approved screen's "Contact the
 * client") — opening that user's existing conversation, or a freshly synthesized
 * one when none exists yet (see {@link resolveContactRoom} + {@link PopulatedWorkspace}).
 */
export function ChatWorkspace({ emptyState }: Props) {
  const { t } = useTranslation();
  const { data: rooms, isPending, isError } = useMyChats();

  if (isPending) {
    return (
      <Centered role="status" busy>
        <span className="text-chat-muted text-sm">{t('a11y.loading')}</span>
      </Centered>
    );
  }
  if (isError) {
    return (
      <Centered role="alert">
        <span className="text-foreground/80 text-sm">{t('errors.generic')}</span>
      </Centered>
    );
  }
  return <PopulatedWorkspace rooms={rooms ?? []} emptyState={emptyState} />;
}

function PopulatedWorkspace({ rooms, emptyState }: { rooms: ChatRoom[]; emptyState: ReactNode }) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const params = useSearchParams();
  // `undefined` = nothing chosen yet (fall back to the deep-link target);
  // `null` = the user explicitly closed the open conversation.
  const [selection, setSelection] = useState<string | null | undefined>(undefined);

  const { roomId: deepLinkRoomId, syntheticRoom } = resolveContactRoom({
    targetUserId: Number(params.get('user')) || null,
    targetName: params.get('name') ?? undefined,
    targetProjectId: Number(params.get('project')) || null,
    currentUserId,
    rooms,
  });

  const allRooms = syntheticRoom ? [syntheticRoom, ...rooms] : rooms;
  if (allRooms.length === 0) return <Centered>{emptyState}</Centered>;

  const selectedRoomId = selection === undefined ? deepLinkRoomId : selection;
  const selectedRoom = allRooms.find((room) => room.roomId === selectedRoomId) ?? null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 p-6">
      <SectionTitle />
      {/* Per Figma 1046:7379: the main chat area is the inline-start element and
          the conversation list the inline-end — so in ar (dir=ltr) the chat sits
          on the left and the list on the right, and it mirrors in en (dir=rtl). */}
      <div className="border-chat-border flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border lg:flex-row">
        <MainChatArea
          room={selectedRoom}
          onBack={() => setSelection(null)}
          className={selectedRoom ? 'flex' : 'hidden lg:flex'}
        />
        <ChatListPanel
          rooms={allRooms}
          selectedRoomId={selectedRoomId}
          onSelect={(roomId) => setSelection(roomId)}
          className={selectedRoom ? 'hidden lg:flex' : 'flex'}
        />
      </div>
    </div>
  );
}

function Centered({
  children,
  role,
  busy,
}: {
  children: ReactNode;
  role?: 'status' | 'alert';
  busy?: boolean;
}) {
  return (
    <div
      role={role}
      aria-busy={busy}
      className="flex flex-1 items-center justify-center px-4 py-16"
    >
      {children}
    </div>
  );
}
