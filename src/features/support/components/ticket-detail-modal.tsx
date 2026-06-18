'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal, Skeleton } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { useTicket } from '../api';
import { conventionalDir } from '../lib/support-format';

import { SupportModalHeader } from './support-modal-header';
import { TicketThread } from './ticket-thread';

type Props = { ticketId: number | null; locale: Locale; onClose: () => void };

/** Ticket detail — fetches GET /support/tickets/:id (incl. messages) while open. */
export function TicketDetailModal({ ticketId, locale, onClose }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const { data, isPending, isError } = useTicket(ticketId);

  return (
    <Modal
      open={ticketId !== null}
      onClose={onClose}
      labelledBy={titleId}
      className="max-w-2xl"
      dir={conventionalDir(locale)}
    >
      <SupportModalHeader
        titleId={titleId}
        title={t('support.ticket.detailTitle')}
        closeLabel={t('support.ticket.close')}
        onClose={onClose}
      />
      {isPending ? (
        <div className="flex flex-col gap-3 p-6" aria-hidden>
          <Skeleton className="h-6 w-40 self-end rounded-full" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : isError || !data ? (
        <p className="text-muted-foreground p-6 text-start text-sm">
          {t('support.ticket.detailError')}
        </p>
      ) : (
        <TicketThread ticket={data} locale={locale} />
      )}
    </Modal>
  );
}
