'use client';

import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  apiPaymentType,
  type PhasePaymentChoice,
  phasePaymentAmount,
  phaseRemaining,
  validatePaymentAmount,
} from '../../lib/phase-payment';
import { formatBudget } from '../../lib/project-format';
import { type ProjectPhase } from '../../schemas/project-phase';

import { FullOption, PartialOption } from './payment-option-rows';

/** Outcome of the choose-payment step, handed to the review step (5d.2). */
export type PaymentSelection = { amount: number; paymentType: 'FULL' | 'PARTIAL' };

type Props = {
  phase: ProjectPhase;
  onCancel: () => void;
  onConfirm: (selection: PaymentSelection) => void;
};

/**
 * Choose-payment panel (Figma node 1547:7652) — rendered **inline** in the left
 * column, above the payments-status card (not a popup). Per the RN flow the
 * customer pays **one phase** — the full phase amount (recommended) or a smaller
 * partial amount, never the whole project. Picking "partial" reveals a custom
 * amount validated against the phase's remaining balance. Confirm hands the chosen
 * amount + FULL/PARTIAL flag to the review step.
 */
export function PaymentOptionsModal({ phase, onCancel, onConfirm }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const [choice, setChoice] = useState<PhasePaymentChoice>('full');
  const [custom, setCustom] = useState('');
  const [error, setError] = useState<string | null>(null);

  const remaining = phaseRemaining(phase);
  const amount = phasePaymentAmount(phase, choice, custom);

  const select = (next: PhasePaymentChoice) => {
    setChoice(next);
    setError(null);
  };

  const handleConfirm = () => {
    const key = validatePaymentAmount(amount, remaining, choice);
    if (key) {
      setError(t(`dashboard.payment.options.error.${key}`, { max: formatBudget(remaining) }));
      return;
    }
    onConfirm({ amount, paymentType: apiPaymentType(amount, remaining) });
  };

  return (
    <section
      aria-labelledby={titleId}
      className="bg-card border-border flex w-full flex-col gap-6 rounded-xl border p-6 shadow-[0px_4px_10px_rgba(0,0,0,0.03)]"
    >
      <Header titleId={titleId} />
      <hr className="border-border" />
      <div role="radiogroup" aria-labelledby={titleId} className="flex flex-col gap-6">
        <FullOption
          remaining={remaining}
          selected={choice === 'full'}
          onSelect={() => select('full')}
        />
        <PartialOption
          selected={choice === 'partial'}
          onSelect={() => select('partial')}
          value={custom}
          onChange={(v) => {
            setCustom(v);
            setError(null);
          }}
          remaining={remaining}
          error={error}
        />
      </div>
      <Actions onCancel={onCancel} onConfirm={handleConfirm} disabled={amount <= 0} />
    </section>
  );
}

function Header({ titleId }: { titleId: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col gap-2">
      <h2 id={titleId} dir="auto" className="text-foreground w-full text-start text-lg font-medium">
        {t('dashboard.payment.options.title')}
      </h2>
      <p dir="auto" className="text-foreground/60 w-full text-start text-[13px]">
        {t('dashboard.payment.options.subtitle')}
      </p>
    </div>
  );
}

function Actions({
  onCancel,
  onConfirm,
  disabled,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-stretch gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="border-border text-foreground focus-visible:outline-ring h-12 flex-1 rounded-lg border text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t('dashboard.payment.options.cancel')}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={disabled}
        className="bg-brand-dark-navy text-on-media focus-visible:outline-ring h-12 flex-1 rounded-lg text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 motion-safe:hover:opacity-90"
      >
        {t('dashboard.payment.options.confirm')}
      </button>
    </div>
  );
}
