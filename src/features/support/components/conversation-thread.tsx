'use client';

import { useTranslation } from 'react-i18next';

import { Skeleton } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { type Locale } from '@/types/locale';

import { formatSupportDate } from '../lib/support-format';
import { type ConversationMessage } from '../schemas/conversation';

import { MessageBubble } from './message-bubble';
import { MessageComposer } from './message-composer';
import { useConversation } from './use-conversation';

type Props = { roomId: string; receiverId: number | null; locale: Locale; canSend: boolean };

function ThreadMessages({
  messages,
  currentUserId,
  locale,
}: {
  messages: ConversationMessage[];
  currentUserId?: number;
  locale: Locale;
}) {
  const { t } = useTranslation();
  if (messages.length === 0) {
    return (
      <p className="text-muted-foreground m-auto text-center text-sm">
        {t('support.conversation.empty')}
      </p>
    );
  }
  return (
    <>
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          mine={m.senderId === currentUserId}
          content={m.content ?? ''}
          meta={formatSupportDate(m.createdAt, locale)}
        />
      ))}
    </>
  );
}

/** The message column + composer for a support conversation room. */
export function ConversationThread({ roomId, receiverId, locale, canSend }: Props) {
  const { t } = useTranslation();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { messages, isPending, isError, isSending, send } = useConversation(roomId, receiverId);

  return (
    <div className="flex h-[60vh] flex-col">
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {isPending ? (
          <Skeleton className="h-10 w-2/3 rounded-2xl" aria-hidden />
        ) : isError ? (
          <p className="text-muted-foreground m-auto text-sm">{t('support.conversation.error')}</p>
        ) : (
          <ThreadMessages messages={messages} currentUserId={currentUserId} locale={locale} />
        )}
      </div>
      {canSend ? (
        <MessageComposer pending={isSending} locale={locale} onSend={send} />
      ) : (
        <p className="border-border text-muted-foreground border-t p-3 text-center text-xs">
          {t('support.conversation.closed')}
        </p>
      )}
    </div>
  );
}
