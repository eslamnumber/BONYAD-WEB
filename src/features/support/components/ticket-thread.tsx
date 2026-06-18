'use client';

import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/stores/auth-store';
import { type Locale } from '@/types/locale';

import { useReplyTicket } from '../api';
import { formatSupportDate } from '../lib/support-format';
import { isTicketOpen } from '../lib/ticket-format';
import { type SupportTicket, type TicketMessage } from '../schemas/ticket';

import { MessageBubble } from './message-bubble';
import { MessageComposer } from './message-composer';
import { TicketStatusBadge } from './ticket-status-badge';

/** Robust "is this my message" — prefer the explicit admin flag/role, fall back to sender id. */
function isMine(message: TicketMessage, currentUserId?: number): boolean {
  if (typeof message.isAdminMessage === 'boolean') return !message.isAdminMessage;
  if (message.senderRole) return message.senderRole.toUpperCase() !== 'ADMIN';
  return message.senderId === currentUserId;
}

/** Status badge + subject. Resolving a ticket is admin-only on the backend, so there
 *  is no user-facing resolve action here. */
function ThreadHeader({ ticket }: { ticket: SupportTicket }) {
  return (
    <div className="border-border flex items-center justify-between gap-3 border-b p-5">
      <TicketStatusBadge status={ticket.status} />
      <h3
        dir="auto"
        className="text-foreground min-w-0 truncate text-start text-base font-semibold"
      >
        {ticket.subject}
      </h3>
    </div>
  );
}

function ThreadMessages({
  ticket,
  currentUserId,
  locale,
}: {
  ticket: SupportTicket;
  currentUserId?: number;
  locale: Locale;
}) {
  const { t } = useTranslation();
  const messages = ticket.messages ?? [];
  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
      {ticket.description ? (
        <MessageBubble
          mine
          content={ticket.description}
          meta={formatSupportDate(ticket.createdAt, locale)}
        />
      ) : null}
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          mine={isMine(m, currentUserId)}
          content={m.content ?? ''}
          meta={[m.senderName, formatSupportDate(m.createdAt, locale)].filter(Boolean).join(' · ')}
        />
      ))}
      {messages.length === 0 && !ticket.description ? (
        <p className="text-muted-foreground m-auto text-sm">{t('support.ticket.noMessages')}</p>
      ) : null}
    </div>
  );
}

/** Ticket detail body: header (status + subject) + message thread + reply composer. */
export function TicketThread({ ticket, locale }: { ticket: SupportTicket; locale: Locale }) {
  const { t } = useTranslation();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const reply = useReplyTicket();
  const open = isTicketOpen(ticket.status);

  return (
    <div className="flex max-h-[70vh] flex-col">
      <ThreadHeader ticket={ticket} />
      <ThreadMessages ticket={ticket} currentUserId={currentUserId} locale={locale} />
      {open ? (
        <MessageComposer
          pending={reply.isPending}
          locale={locale}
          onSend={(text) => reply.mutateAsync({ id: ticket.id, text }).then(() => undefined)}
        />
      ) : (
        <p className="border-border text-muted-foreground border-t p-3 text-center text-xs">
          {t('support.ticket.closedNote')}
        </p>
      )}
    </div>
  );
}
