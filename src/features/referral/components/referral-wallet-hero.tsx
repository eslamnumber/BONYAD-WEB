'use client';

import Image from 'next/image';
import { useTranslation } from 'react-i18next';

import { StarIcon } from '@/components/icons';
import type { Locale } from '@/types/locale';

import { formatSar, nextTierProgress } from '../lib/referral-format';
import type { ReferralStats } from '../types/referral';

import { ReferralMoney } from './referral-money';

/** Next-reward-tier meter, or the "all tiers unlocked" line when none remains. */
function TierProgress({ stats, locale }: { stats: ReferralStats; locale: Locale }) {
  const { t } = useTranslation();
  const tier = nextTierProgress(stats);
  if (!tier) {
    return (
      <p className="text-sm leading-6 text-white/85" dir="auto">
        {t('referral.hero.tierComplete')}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm leading-6 text-white/90" dir="auto">
        {t('referral.hero.nextTier', {
          remaining: tier.remaining,
          reward: formatSar(tier.reward, locale),
        })}
      </p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
        <div
          className="from-progress-from to-progress-to h-full rounded-full bg-gradient-to-r rtl:bg-gradient-to-l"
          style={{ width: `${tier.pct}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Reward-wallet hero — the signature brand-blue banner (mirrors the profile identity
 * card idiom: `--primary` → `--brand-navy`, white via `--primary-foreground`, the
 * Bonyad skyline faint along the base). Leads with the SAR balance + reward glyph,
 * a punctuated subtitle (`dir="auto"`), and the next-tier progress meter.
 */
export function ReferralWalletHero({
  balance,
  stats,
  locale,
}: {
  balance: number;
  stats: ReferralStats;
  locale: Locale;
}) {
  const { t } = useTranslation();
  return (
    <section className="from-primary to-brand-navy text-primary-foreground relative isolate flex flex-col gap-5 overflow-hidden rounded-3xl bg-gradient-to-bl px-5 py-7 shadow-sm sm:px-7 sm:py-8">
      <Image
        src="/images/bg/customer-dashboard-skyline.png"
        alt=""
        width={1264}
        height={712}
        sizes="900px"
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 hidden h-32 w-full [mask-image:linear-gradient(to_top,black,transparent)] object-cover object-bottom opacity-[0.13] invert select-none sm:block rtl:-scale-x-100"
      />
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-white/85">
            {t('referral.hero.balanceLabel')}
          </span>
          <span className="text-3xl font-bold sm:text-4xl">
            <ReferralMoney
              value={balance}
              locale={locale}
              glyphClassName="mb-1 h-7 w-auto sm:h-8"
            />
          </span>
        </div>
        <span className="inline-flex shrink-0 rounded-2xl bg-white/15 p-3">
          <StarIcon className="size-7" aria-hidden />
        </span>
      </div>
      <p className="max-w-md text-sm leading-6 text-white/90" dir="auto">
        {t('referral.hero.subtitle')}
      </p>
      <TierProgress stats={stats} locale={locale} />
    </section>
  );
}
