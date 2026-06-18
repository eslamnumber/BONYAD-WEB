'use client';

import { useTranslation } from 'react-i18next';

/**
 * Soft-pill colour per transaction / refund status, reusing the dashboard status
 * tokens (each has a `.dark` pair). Mirrors the iOS `PaymentStatusBadge` mapping:
 * green = completed/approved/processed, amber = pending, red = failed/rejected,
 * blue = refunded. Unknown values fall back to a neutral muted pill (rule 1 — the
 * backend can add a status without breaking the UI).
 */
const STATUS_CLASS: Record<string, string> = {
  COMPLETED: 'bg-status-approved-soft text-status-approved',
  APPROVED: 'bg-status-approved-soft text-status-approved',
  PROCESSED: 'bg-status-approved-soft text-status-approved',
  PENDING: 'bg-status-progress-soft text-status-progress',
  FAILED: 'bg-status-rejected-soft text-status-rejected',
  REJECTED: 'bg-status-rejected-soft text-status-rejected',
  REFUNDED: 'bg-status-offer-soft text-status-offer',
};
const FALLBACK = 'bg-muted text-foreground/60';

export function TransactionStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const cls = STATUS_CLASS[status.toUpperCase()] ?? FALLBACK;
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${cls}`}
    >
      {t(`dashboard.transactions.status.${status.toLowerCase()}`, { defaultValue: status })}
    </span>
  );
}
