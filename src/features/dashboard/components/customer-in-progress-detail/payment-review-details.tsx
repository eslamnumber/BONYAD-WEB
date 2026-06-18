'use client';

import { useTranslation } from 'react-i18next';

import { phasesRemainingAfter, totalOutstanding } from '../../lib/phase-payment';
import { type ProjectPhase } from '../../schemas/project-phase';
import { MoneyAmount } from '../money-amount';

import { PaymentSummaryCard, SummaryRow } from './payment-summary-card';

/** "Operation details" card (Figma 1553:8107): phase amount · processing fee · total. */
export function OperationDetails({ amount }: { amount: number }) {
  const { t } = useTranslation();
  return (
    <PaymentSummaryCard heading={t('dashboard.payment.review.detailsHeading')}>
      <SummaryRow label={t('dashboard.payment.review.phaseValue')}>
        <MoneyAmount value={amount} />
      </SummaryRow>
      <SummaryRow label={t('dashboard.payment.review.processingFee')}>
        <MoneyAmount value={0} />
      </SummaryRow>
      <SummaryRow label={t('dashboard.payment.review.total')}>
        <MoneyAmount value={amount} />
      </SummaryRow>
    </PaymentSummaryCard>
  );
}

/**
 * "Remaining after payment" card (Figma 1553:8125): each phase that will still owe
 * money once this payment clears + the total. Hidden when nothing is left to pay.
 */
export function RemainingAfter({
  phase,
  phases,
  amount,
}: {
  phase: ProjectPhase;
  phases: ProjectPhase[];
  amount: number;
}) {
  const { t } = useTranslation();
  const entries = phasesRemainingAfter(phases, phase.id, amount);
  if (entries.length === 0) return null;

  return (
    <PaymentSummaryCard heading={t('dashboard.payment.review.remainingHeading')}>
      {entries.map(({ phase: p, outstanding }) => (
        <SummaryRow
          key={p.id}
          label={
            <span dir="auto">
              {t('dashboard.payment.review.remainingPhase', {
                number: p.phaseNumber ?? '?',
                title: p.title ?? p.description ?? '',
              })}
            </span>
          }
        >
          <MoneyAmount value={outstanding} />
        </SummaryRow>
      ))}
      <SummaryRow label={t('dashboard.payment.review.remainingTotal')}>
        <MoneyAmount value={totalOutstanding(entries)} />
      </SummaryRow>
    </PaymentSummaryCard>
  );
}
