'use client';

import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';

import { formatBudget } from '../lib/project-format';

/**
 * A SAR money amount: grouped digits + the official Saudi Riyal glyph
 * (figma-to-code §Icons rule 10), with an sr-only "SAR" for screen readers.
 * Shared across the dashboard — budget/payment cards, the project card and the
 * job-offer list all render currency this way (Riyal as an icon, never a "K"/"SAR"
 * text suffix).
 */
export function MoneyAmount({ value }: { value: number }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1">
      {formatBudget(value)}
      <SaudiRiyalIcon className="h-3.5 w-auto shrink-0" aria-hidden />
      <span className="sr-only">{t('dashboard.jobOffer.summary.currency')}</span>
    </span>
  );
}
