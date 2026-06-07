'use client';

import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { MoreHorizontalIcon } from '@/components/icons';

import type { ChatRoom } from '../schemas/chat';

type Props = {
  room: ChatRoom;
  onBack?: () => void;
};

/**
 * Thread header (Figma 1046:7383) — conversation menu on one edge, the peer's
 * name + role + avatar on the other. A back control (mobile only) returns to the
 * list in the master-detail layout.
 */
export function ChatHeader({ room, onBack }: Props) {
  const { t } = useTranslation();
  const name = room.otherUserName ?? '';
  const roleKey = room.otherUserRole?.toUpperCase() === 'TECHNICIAN' ? 'technician' : 'customer';

  return (
    <header className="border-chat-border flex items-center justify-between gap-3 border-b px-6 py-4">
      <div className="flex items-center gap-1">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={t('messages.back')}
            className="text-chat-muted motion-safe:hover:bg-chat-item-active/50 -ms-2 flex size-9 items-center justify-center rounded-full lg:hidden"
          >
            <ChevronRight className="size-5 ltr:-scale-x-100" aria-hidden />
          </button>
        ) : null}
        <button
          type="button"
          aria-label={t('messages.conversationMenu')}
          title={t('common.comingSoon')}
          className="text-chat-muted flex size-6 items-center justify-center"
        >
          <MoreHorizontalIcon className="size-6" aria-hidden />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end gap-0.5">
          <p dir="auto" className="text-foreground text-base font-medium">
            {name}
          </p>
          <p dir="auto" className="text-foreground/80 text-xs">
            {t(`dashboard.role.${roleKey}`)}
          </p>
        </div>
        <Avatar name={name} src={room.otherUserProfileImage} className="size-10" />
      </div>
    </header>
  );
}
