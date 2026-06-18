'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { useTickets } from '../api';
import { TICKET_FILTERS, type TicketFilter } from '../schemas/ticket';

import { NewTicketModal } from './new-ticket-modal';
import { PanelToolbar } from './panel-toolbar';
import { TicketDetailModal } from './ticket-detail-modal';
import { TicketList } from './ticket-list';

/** Tickets tab — status filter + new-ticket CTA + the ticket list (threaded detail modal). */
export function TicketsPanel({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<TicketFilter>('ALL');
  const [creating, setCreating] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const query = useTickets(filter);

  const filterOptions = TICKET_FILTERS.map((f) => ({
    value: f,
    label: t(`support.ticketFilter.${f.toLowerCase()}`),
  }));

  return (
    <div className="flex flex-col gap-4">
      <PanelToolbar
        options={filterOptions}
        value={filter}
        onChange={setFilter}
        ariaLabel={t('support.ticketFilter.aria')}
        ctaLabel={t('support.ticket.new')}
        onCta={() => setCreating(true)}
      />

      <TicketList
        tickets={query.data ?? []}
        isPending={query.isPending}
        isError={query.isError}
        locale={locale}
        onRetry={() => void query.refetch()}
        onOpen={setDetailId}
      />

      <NewTicketModal open={creating} locale={locale} onClose={() => setCreating(false)} />
      <TicketDetailModal ticketId={detailId} locale={locale} onClose={() => setDetailId(null)} />
    </div>
  );
}
