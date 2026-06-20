'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import type { Locale } from '@/types/locale';

import { useReferralStats } from '../api/get-referral-stats';
import { useReferrals } from '../api/get-referrals';
import { useReferralWallet } from '../api/get-wallet';
import { resolveBalance } from '../lib/referral-format';
import { hasReferralActivity } from '../lib/referral-groups';
import type { ReferralList as ReferralListData } from '../types/referral';

import { ReferralInviteForm } from './referral-invite-form';
import { ReferralList } from './referral-list';
import { ReferralSkeleton } from './referral-skeleton';
import { ReferralWalletHero } from './referral-wallet-hero';

/**
 * Signature ambient glow — one soft purple color-ellipse (the reward accent) behind
 * the hero, for on-brand depth. Inert, behind content (`-z-10`), desktop-gated (never
 * a source of horizontal scroll on phones), dark-safe. Centred → no mirror flip.
 */
function AmbientGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 hidden justify-center overflow-hidden lg:flex"
    >
      <div className="bg-deco-blob-purple mt-[-160px] h-[420px] w-[560px] rounded-full opacity-20 blur-[120px]" />
    </div>
  );
}

/** Back link to the profile hub — chevron points to the inline-start under conventional dir. */
function BackLink() {
  const { t } = useTranslation();
  return (
    <nav className="flex">
      <Link
        href={ROUTES.DASHBOARD_SETTINGS}
        className="text-brand-dark-navy focus-visible:outline-ring inline-flex items-center gap-1.5 rounded text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-80"
      >
        {t('referral.back')}
        <ChevronLeft className="size-3.5 shrink-0 rtl:-scale-x-100" aria-hidden />
      </Link>
    </nav>
  );
}

function Header() {
  const { t } = useTranslation();
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-foreground text-2xl font-bold">{t('referral.title')}</h1>
      <p className="text-muted-foreground text-sm leading-6" dir="auto">
        {t('referral.subtitle')}
      </p>
    </header>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <section className="bg-card border-border flex flex-col items-center gap-3 rounded-2xl border p-8 text-center shadow-sm">
      <h2 className="text-foreground text-lg font-semibold">{t('referral.error.title')}</h2>
      <p className="text-muted-foreground max-w-sm text-sm leading-6">
        {t('referral.error.subtitle')}
      </p>
      <Button type="button" variant="outline" onClick={onRetry} className="mt-1">
        {t('referral.error.retry')}
      </Button>
    </section>
  );
}

type ReferralScreenData = {
  isPending: boolean;
  isError: boolean;
  list: ReferralListData | undefined;
  balance: number;
  hasActivity: boolean;
  retry: () => void;
};

/** Compose the three referral queries into the screen view-model. Wallet is non-critical. */
function useReferralScreenData(): ReferralScreenData {
  const stats = useReferralStats();
  const wallet = useReferralWallet();
  const referrals = useReferrals();
  return {
    isPending: stats.isPending || referrals.isPending,
    isError: stats.isError || referrals.isError,
    list: referrals.data,
    balance: resolveBalance(wallet.data, stats.data),
    hasActivity: hasReferralActivity(referrals.data),
    retry: () => {
      void stats.refetch();
      void wallet.refetch();
      void referrals.refetch();
    },
  };
}

/** The settled body: hero + invite field + the grouped list once there's activity. */
function ReferralBody({ data, locale }: { data: ReferralScreenData; locale: Locale }) {
  return (
    <>
      <ReferralWalletHero balance={data.balance} locale={locale} />
      <ReferralInviteForm />
      {data.hasActivity ? <ReferralList list={data.list} locale={locale} /> : null}
    </>
  );
}

/**
 * Refer & earn (`/dashboard/settings/referral`) — both roles, rebuilt to match
 * Figma 1691:2642: back link, header + subtitle, the purple reward-wallet hero and
 * the inline-send invite field, with the grouped invitations list appended once
 * there's activity. Reads the wallet, funnel stats (balance fallback) and
 * invitations list. This screen uses the NATURAL direction (en→ltr / ar→rtl) via a
 * scoped `dir`, not the project's inverted mapping — every logical utility inside
 * re-resolves accordingly.
 */
export function ReferralScreen() {
  const { i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const data = useReferralScreenData();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <div
      dir={dir}
      className="relative isolate mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6"
    >
      <AmbientGlow />
      <BackLink />
      <Header />
      {data.isPending ? <ReferralSkeleton /> : null}
      {data.isError ? <ErrorState onRetry={data.retry} /> : null}
      {!data.isPending && !data.isError ? <ReferralBody data={data} locale={locale} /> : null}
    </div>
  );
}
