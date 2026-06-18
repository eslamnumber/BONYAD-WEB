'use client';

import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';
import type { Locale } from '@/types/locale';

import { formatSar } from '../lib/referral-format';

/**
 * A SAR reward amount: grouped digits + the official Saudi Riyal glyph, with an
 * sr-only "SAR"/"ريال" for screen readers (matches the dashboard money convention —
 * the Riyal is an icon, never a text suffix). Digits stay `ltr` so a balance reads
 * left-to-right in both locales. `glyphClassName` sizes the glyph to the number.
 */
export function ReferralMoney({
  value,
  locale,
  glyphClassName = 'h-[0.8em] w-auto shrink-0',
}: {
  value: number | null | undefined;
  locale: Locale;
  glyphClassName?: string;
}) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1">
      <span dir="ltr">{formatSar(value, locale)}</span>
      <SaudiRiyalIcon className={glyphClassName} aria-hidden />
      <span className="sr-only">{t('referral.currency')}</span>
    </span>
  );
}
