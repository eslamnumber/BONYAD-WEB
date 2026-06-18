'use client';

import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { formatTransactionDate } from '../../lib/transaction-format';
import type { PaymentTransaction } from '../../schemas/transaction';
import { MoneyAmount } from '../money-amount';

import { TransactionRefundAction } from './transaction-refund-action';
import { TransactionStatusBadge } from './transaction-status-badge';

type Props = {
  transaction: PaymentTransaction;
  locale: Locale;
  onRequestRefund: (transaction: PaymentTransaction) => void;
};

/**
 * One payment transaction (iOS `TransactionCard`): the payment type + project +
 * phase on the inline-start, the amount + status badge on the inline-end, then a
 * footer with the card brand + completed date, and the refund affordance.
 */
export function TransactionCard({ transaction, locale, onRequestRefund }: Props) {
  const date = formatTransactionDate(transaction.completedAt ?? transaction.createdAt, locale);

  return (
    <article className="bg-card border-border flex flex-col gap-4 rounded-xl border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <TransactionMeta transaction={transaction} />
        <TransactionAmount transaction={transaction} />
      </div>
      <div className="border-border flex items-center justify-between gap-3 border-t pt-3">
        {transaction.paymentBrand ? (
          <span className="text-foreground/60 text-xs font-medium">{transaction.paymentBrand}</span>
        ) : (
          <span />
        )}
        <span className="text-foreground/60 text-xs">{date}</span>
      </div>
      <TransactionRefundAction transaction={transaction} onRequestRefund={onRequestRefund} />
    </article>
  );
}

function TransactionMeta({ transaction }: { transaction: PaymentTransaction }) {
  const { t } = useTranslation();
  const typeKey = (transaction.paymentType ?? '').toLowerCase();

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-foreground text-sm font-semibold">
        {t(`dashboard.transactions.type.${typeKey}`, {
          defaultValue: t('dashboard.transactions.type.default'),
        })}
      </p>
      {transaction.projectDescription ? (
        <p dir="auto" className="text-foreground/60 line-clamp-2 text-start text-xs">
          {transaction.projectDescription}
        </p>
      ) : null}
      {typeof transaction.phaseNumber === 'number' ? (
        <p className="text-foreground/60 text-xs">
          {t('dashboard.transactions.card.phase', { number: transaction.phaseNumber })}
        </p>
      ) : null}
    </div>
  );
}

function TransactionAmount({ transaction }: { transaction: PaymentTransaction }) {
  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <span className="text-foreground text-base font-bold">
        <MoneyAmount value={transaction.amount} />
      </span>
      <TransactionStatusBadge status={transaction.status} />
    </div>
  );
}
