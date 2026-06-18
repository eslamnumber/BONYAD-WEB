'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { formatBudget } from '../../lib/project-format';
import { MoneyAmount } from '../money-amount';

import { PaymentOptionCard } from './payment-option-card';

/** Full-phase option (recommended): the whole remaining balance, in the purple accent. */
export function FullOption({
  remaining,
  selected,
  onSelect,
}: {
  remaining: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  return (
    <PaymentOptionCard
      accent="full"
      recommended
      selected={selected}
      onSelect={onSelect}
      title={t('dashboard.payment.options.full.title')}
      description={t('dashboard.payment.options.full.description')}
    >
      <div className="flex w-full justify-end">
        <span className="text-status-bid text-xl font-medium">
          <MoneyAmount value={remaining} />
        </span>
      </div>
    </PaymentOptionCard>
  );
}

/** Partial option: a custom amount (revealed when selected), validated < remaining. */
export function PartialOption({
  selected,
  onSelect,
  value,
  onChange,
  remaining,
  error,
}: {
  selected: boolean;
  onSelect: () => void;
  value: string;
  onChange: (v: string) => void;
  remaining: number;
  error: string | null;
}) {
  const { t } = useTranslation();
  return (
    <PaymentOptionCard
      accent="partial"
      selected={selected}
      onSelect={onSelect}
      title={t('dashboard.payment.options.partial.title')}
      description={t('dashboard.payment.options.partial.description')}
    >
      {selected ? (
        <AmountInput value={value} onChange={onChange} max={remaining} error={error} />
      ) : null}
    </PaymentOptionCard>
  );
}

function AmountInput({
  value,
  onChange,
  max,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  max: number;
  error: string | null;
}) {
  const { t } = useTranslation();
  const id = useId();
  return (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor={id} className="text-foreground text-end text-[13px] font-medium">
        {t('dashboard.payment.options.partial.inputLabel')}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-border bg-field-surface text-foreground focus-visible:outline-ring rounded-lg border px-3 py-2.5 text-end text-base focus-visible:outline-2"
      />
      <p
        dir="auto"
        className={`w-full text-start text-[13px] ${error ? 'text-status-rejected' : 'text-muted-foreground'}`}
      >
        {error ?? t('dashboard.payment.options.partial.inputHint', { max: formatBudget(max) })}
      </p>
    </div>
  );
}
