'use client';

import { Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Locale } from '@/types/locale';

import { ReferralMoney } from './referral-money';

/**
 * Reward-wallet hero (Figma 1691:2642) — a purple gradient banner
 * (`--reward-hero-from` #8A38F5 → `--reward-hero-to` #51218F) leading with a gift
 * glyph, then the SAR balance + "wallet balance" label. White content reads on
 * both gradient stops in light and dark. The gift sits at the inline-start (the
 * reading anchor); the balance number stays a discrete node (grouped digits +
 * Saudi-Riyal glyph) so it localizes cleanly.
 */
export function ReferralWalletHero({ balance, locale }: { balance: number; locale: Locale }) {
  const { t } = useTranslation();
  return (
    <section className="from-reward-hero-from to-reward-hero-to flex items-center gap-4 rounded-2xl bg-gradient-to-r px-5 py-6 text-white shadow-sm sm:px-6">
      <Gift className="size-12 shrink-0 sm:size-14" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-2xl font-bold sm:text-3xl">
          <ReferralMoney
            value={balance}
            locale={locale}
            glyphClassName="mb-0.5 h-6 w-auto sm:h-7"
          />
        </span>
        <span className="text-sm font-medium text-white/80">{t('referral.hero.balanceLabel')}</span>
      </div>
    </section>
  );
}
