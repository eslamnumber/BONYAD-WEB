'use client';

import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons';
import { type Locale } from '@/types/locale';

import { conventionalDir, formatSupportDate, resolveSupportPriority } from '../lib/support-format';
import { type SupportTicket } from '../schemas/ticket';

import { TicketStatusBadge } from './ticket-status-badge';

type Props = { ticket: SupportTicket; locale: Locale; onOpen: (id: number) => void };

/**
 * One ticket as a drill-in card. **Conventional direction** (this screen overrides the
 * inverted map): badge leads, subject + meta are `text-start`, drill chevron trails (forward;
 * flip computed from `conventionalDir`, not a `ltr:` variant — see RequestCard). `<bdi>`
 * isolates the subject script for a consistent column edge.
 */
export function TicketCard({ ticket, locale, onOpen }: Props) {
  const { t } = useTranslation();
  const date = formatSupportDate(ticket.createdAt, locale);
  const priority = resolveSupportPriority(ticket.priority);
  const meta = [date, t(priority.labelKey)].filter(Boolean).join(' · ');

  return (
    <button
      type="button"
      onClick={() => onOpen(ticket.id)}
      className="focus-visible:outline-ring bg-card border-border motion-safe:hover:bg-muted/40 flex w-full items-center gap-3 rounded-2xl border p-4 shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <TicketStatusBadge status={ticket.status} />
      <span className="min-w-0 flex-1">
        <span className="text-foreground block truncate text-start text-sm font-medium">
          <bdi>{ticket.subject}</bdi>
        </span>
        <span className="text-muted-foreground mt-1 block truncate text-start text-xs">{meta}</span>
      </span>
      <ChevronLeftIcon
        className={`text-muted-foreground/50 size-3 shrink-0 ${conventionalDir(locale) === 'ltr' ? '-scale-x-100' : ''}`}
        aria-hidden
      />
    </button>
  );
}
