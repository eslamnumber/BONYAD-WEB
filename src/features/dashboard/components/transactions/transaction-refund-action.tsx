'use client';

import { Clock, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { PaymentTransaction } from '../../schemas/transaction';

/**
 * The card's refund affordance: an amber "Request refund" button when the backend
 * allows it (`canRequestRefund`), a read-only "Refund request pending" chip once a
 * request exists (`hasRefundRequest`), or nothing. Mirrors the iOS TransactionCard
 * footer. The system glyphs (undo arrow / clock) match the iOS SF Symbols.
 */
export function TransactionRefundAction({
  transaction,
  onRequestRefund,
}: {
  transaction: PaymentTransaction;
  onRequestRefund: (transaction: PaymentTransaction) => void;
}) {
  const { t } = useTranslation();

  if (transaction.canRequestRefund) {
    return (
      <button
        type="button"
        onClick={() => onRequestRefund(transaction)}
        className="bg-status-progress text-on-media inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold motion-safe:transition-opacity motion-safe:hover:opacity-90"
      >
        <RotateCcw className="size-4" aria-hidden />
        {t('dashboard.transactions.card.refundAction')}
      </button>
    );
  }

  if (transaction.hasRefundRequest) {
    return (
      <span className="bg-status-progress-soft text-status-progress inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium">
        <Clock className="size-4" aria-hidden />
        {t('dashboard.transactions.card.refundPending')}
      </span>
    );
  }

  return null;
}
