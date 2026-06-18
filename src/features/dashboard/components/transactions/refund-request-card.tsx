'use client';

import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { formatTransactionDate } from '../../lib/transaction-format';
import type { RefundRequest } from '../../schemas/transaction';
import { MoneyAmount } from '../money-amount';

import { TransactionStatusBadge } from './transaction-status-badge';

const NOTE_TONE = {
  rejected: 'bg-status-rejected-soft text-status-rejected',
  info: 'bg-status-offer-soft text-status-offer',
} as const;

/** One refund request (iOS `RefundRequestCard`): amount + status, the reason, any
 *  rejection reason / admin notes, and the requested / processed timestamps. */
export function RefundRequestCard({ request, locale }: { request: RefundRequest; locale: Locale }) {
  const { t } = useTranslation();
  return (
    <article className="bg-card border-border flex flex-col gap-4 rounded-xl border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span className="text-foreground text-base font-bold">
          {typeof request.amount === 'number' ? <MoneyAmount value={request.amount} /> : '—'}
        </span>
        <TransactionStatusBadge status={request.status} />
      </div>
      <ReasonBlock
        label={t('dashboard.transactions.refunds.card.reasonLabel')}
        text={request.reason}
      />
      {request.rejectionReason ? (
        <RefundNote
          tone="rejected"
          label={t('dashboard.transactions.refunds.card.rejectionLabel')}
          text={request.rejectionReason}
        />
      ) : null}
      {request.adminNotes ? (
        <RefundNote
          tone="info"
          label={t('dashboard.transactions.refunds.card.adminLabel')}
          text={request.adminNotes}
        />
      ) : null}
      <RefundTimestamps request={request} locale={locale} />
    </article>
  );
}

function ReasonBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-foreground/60 text-xs font-medium">{label}</p>
      <p
        dir="auto"
        className="bg-field-surface text-foreground rounded-lg px-3 py-2.5 text-start text-sm leading-relaxed"
      >
        {text}
      </p>
    </div>
  );
}

function RefundNote({
  tone,
  label,
  text,
}: {
  tone: keyof typeof NOTE_TONE;
  label: string;
  text: string;
}) {
  return (
    <div className={`flex flex-col gap-1 rounded-lg px-3 py-2.5 ${NOTE_TONE[tone]}`}>
      <p className="text-xs font-semibold">{label}</p>
      <p dir="auto" className="text-start text-xs leading-relaxed opacity-90">
        {text}
      </p>
    </div>
  );
}

function RefundTimestamps({ request, locale }: { request: RefundRequest; locale: Locale }) {
  const { t } = useTranslation();
  return (
    <div className="text-foreground/50 flex flex-col gap-0.5 text-xs">
      <span>
        {t('dashboard.transactions.refunds.card.requestedAt', {
          date: formatTransactionDate(request.createdAt, locale),
        })}
      </span>
      {request.processedAt ? (
        <span>
          {t('dashboard.transactions.refunds.card.processedAt', {
            date: formatTransactionDate(request.processedAt, locale),
          })}
        </span>
      ) : null}
    </div>
  );
}
