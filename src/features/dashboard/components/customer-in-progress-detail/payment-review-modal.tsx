'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { type ProjectPhase } from '../../schemas/project-phase';
import { MoneyAmount } from '../money-amount';

import { type PaymentSelection } from './payment-options-modal';
import { OperationDetails, RemainingAfter } from './payment-review-details';

type Props = {
  phase: ProjectPhase;
  phases: ProjectPhase[];
  selection: PaymentSelection;
  /** Back to the choose-payment step. */
  onBack: () => void;
  /** Confirm → start the HyperPay checkout (creates the session, then redirects). */
  onConfirm: () => void;
  /** The checkout request is in flight (button shows a processing state). */
  pending?: boolean;
  /** The checkout request failed — show a retry message. */
  error?: boolean;
};

/**
 * Review & confirm step (Figma node 1553:8005). Shows the amount due for this
 * phase, an "operation details" breakdown (phase amount · processing fee · total),
 * the balance left across the remaining phases, and a note that the funds release
 * to the provider on confirm. Confirm hands off to the checkout redirect (5d.3).
 */
export function PaymentReviewModal({
  phase,
  phases,
  selection,
  onBack,
  onConfirm,
  pending,
  error,
}: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className="bg-card border-border flex w-full flex-col gap-6 rounded-xl border p-6 shadow-[0px_4px_10px_rgba(0,0,0,0.03)]"
    >
      <h2 id={titleId} className="sr-only">
        {t('dashboard.payment.review.title')}
      </h2>
      <AmountDue phase={phase} amount={selection.amount} />
      <hr className="border-border" />
      <OperationDetails amount={selection.amount} />
      <RemainingAfter phase={phase} phases={phases} amount={selection.amount} />
      <Note />
      {error ? (
        <p role="alert" dir="auto" className="text-status-rejected text-start text-[13px]">
          {t('dashboard.payment.review.error')}
        </p>
      ) : null}
      <ReviewActions onBack={onBack} onConfirm={onConfirm} pending={pending} />
    </section>
  );
}

function AmountDue({ phase, amount }: { phase: ProjectPhase; amount: number }) {
  const { t } = useTranslation();
  const number = phase.phaseNumber ?? '?';
  const title = phase.title ?? phase.description ?? '';
  return (
    <div className="flex w-full flex-col items-end gap-2 text-end">
      <p className="text-foreground text-lg font-medium">
        {t('dashboard.payment.review.amountDue')}
      </p>
      <span className="text-phase-amount text-[32px] font-medium">
        <MoneyAmount value={amount} />
      </span>
      <span dir="auto" className="text-foreground/40 text-xs">
        {t('dashboard.payment.review.phaseCaption', { number, title })}
      </span>
    </div>
  );
}

function Note() {
  const { t } = useTranslation();
  return (
    <div className="bg-note-info-soft rounded-lg p-3">
      <p dir="auto" className="text-note-info text-start text-[13px] leading-[1.4]">
        {t('dashboard.payment.review.note')}
      </p>
    </div>
  );
}

function ReviewActions({
  onBack,
  onConfirm,
  pending,
}: {
  onBack: () => void;
  onConfirm: () => void;
  pending?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-stretch gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={pending}
        className="border-border text-foreground focus-visible:outline-ring h-12 flex-1 rounded-lg border text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
      >
        {t('dashboard.payment.review.back')}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={pending}
        aria-busy={pending}
        className="bg-brand-dark-navy text-on-media focus-visible:outline-ring h-12 flex-[2] rounded-lg text-[15px] font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 motion-safe:hover:opacity-90"
      >
        {t(pending ? 'dashboard.payment.review.processing' : 'dashboard.payment.review.confirm')}
      </button>
    </div>
  );
}
