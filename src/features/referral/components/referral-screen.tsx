'use client';

import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';
import type { Locale } from '@/types/locale';

import { useReferralStats } from '../api/get-referral-stats';
import { useReferrals } from '../api/get-referrals';
import { useReferralWallet } from '../api/get-wallet';
import { resolveBalance } from '../lib/referral-format';
import { hasReferralActivity } from '../lib/referral-groups';
import type { ReferralList as ReferralListData, ReferralStats } from '../types/referral';

import { ReferralEmpty } from './referral-empty';
import { ReferralInviteForm } from './referral-invite-form';
import { ReferralList } from './referral-list';
import { ReferralSkeleton } from './referral-skeleton';
import { ReferralStatsRow } from './referral-stats-row';
import { ReferralWalletHero } from './referral-wallet-hero';

/**
 * Signature ambient glow — one soft purple color-ellipse (the reward accent) behind
 * the hero, for on-brand depth instead of a flat page. Inert, behind content (`-z-10`
 * in the screen's isolate), desktop-gated (never a source of horizontal scroll on
 * phones), dark-mode-safe (the token has a `.dark` pair). Centred → no mirror flip.
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

function ReferralHeader() {
  const { t } = useTranslation();
  return <h1 className="text-foreground text-2xl font-bold">{t('referral.title')}</h1>;
}

type ReferralScreenData = {
  isPending: boolean;
  isError: boolean;
  stats: ReferralStats;
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
    stats: stats.data ?? {},
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

/** The settled (loaded, no error) body: hero + funnel + invite form + list/empty. */
function ReferralBody({ data, locale }: { data: ReferralScreenData; locale: Locale }) {
  return (
    <>
      <ReferralWalletHero balance={data.balance} stats={data.stats} locale={locale} />
      <ReferralStatsRow stats={data.stats} />
      <ReferralInviteForm />
      {data.hasActivity ? <ReferralList list={data.list} locale={locale} /> : <ReferralEmpty />}
    </>
  );
}

/**
 * Refer & earn (`/dashboard/settings/referral`) — both roles. Reads the reward wallet
 * (GET /users/me/wallet), funnel stats (…/referrals/stats) and the invitations list
 * (…/referrals), then renders one of: loading skeleton, error+retry, or the wallet
 * hero + funnel + invite form + grouped list (empty state when there's no activity
 * yet). Mirrors the iOS `ReferralView` flow; the contacts picker has no web analogue,
 * so the SMS-by-phone invite is the single invite path. Client island — the `(app)`
 * layout supplies the sidebar + auth gate.
 */
export function ReferralScreen() {
  const { i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const data = useReferralScreenData();

  // Per-screen direction override (requested): this screen reads NATURALLY — English
  // LTR, Arabic RTL — instead of the project's inverted `LOCALE_DIRECTION` mapping
  // (en→rtl / ar→ltr, docs/i18n-and-rtl.md). Scoping `dir` to this root re-resolves
  // every logical utility + `rtl:`/`ltr:` variant inside this subtree only; the rest
  // of the app keeps the documented inverted mapping untouched.
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <div
      dir={dir}
      className="relative isolate mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:gap-8"
    >
      <AmbientGlow />
      <ReferralHeader />
      {data.isPending ? <ReferralSkeleton /> : null}
      {data.isError ? <ErrorState onRetry={data.retry} /> : null}
      {!data.isPending && !data.isError ? <ReferralBody data={data} locale={locale} /> : null}
    </div>
  );
}
