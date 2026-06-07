'use client';

import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/stores/auth-store';

import type { ChatRoom } from '../schemas/chat';

import { ChatComposer } from './chat-composer';
import { ChatHeader } from './chat-header';
import { ChatThread } from './chat-thread';

type Props = {
  room: ChatRoom | null;
  onBack?: () => void;
  className?: string;
};

/**
 * Open-conversation panel (Figma 1046:7382) — peer header, message thread, and
 * composer for the selected room; an empty prompt when none is selected (desktop
 * only — on mobile this panel is hidden until a conversation opens). `className`
 * carries the master-detail show/hide.
 */
export function MainChatArea({ room, onBack, className }: Props) {
  const { t } = useTranslation();
  const currentUserId = useAuthStore((state) => state.user?.id);

  return (
    <section
      aria-label={t('messages.threadAriaLabel')}
      className={`bg-background min-h-0 flex-1 flex-col ${className ?? 'flex'}`}
    >
      {room ? (
        <>
          <ChatHeader room={room} onBack={onBack} />
          <ChatThread room={room} currentUserId={currentUserId} />
          <ChatComposer room={room} />
        </>
      ) : (
        <p className="text-chat-muted flex flex-1 items-center justify-center p-6 text-center text-sm">
          {t('messages.selectConversation')}
        </p>
      )}
    </section>
  );
}
