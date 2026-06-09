'use client';

import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';

const formatAmount = (n: number) => new Intl.NumberFormat('en-US').format(n);

/**
 * A SAR money amount: grouped digits + the official Saudi Riyal glyph
 * (figma-to-code §Icons rule 10), with an sr-only "SAR" for screen readers.
 * Shared by the budget summary (5c) and payment status (5d) cards.
 */
export function MoneyAmount({ value }: { value: number }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1">
      {formatAmount(value)}
      <SaudiRiyalIcon className="h-3.5 w-auto shrink-0" aria-hidden />
      <span className="sr-only">{t('dashboard.jobOffer.summary.currency')}</span>
    </span>
  );
}
