'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import type { Locale } from '@/types/locale';

import { useSubscription } from '../api/get-subscription';

import { ActiveSubscriptionView } from './active-subscription-view';
import { NoSubscriptionEmpty } from './no-subscription-empty';
import {
  SubscriptionFeedbackBanner,
  type SubscriptionFeedback,
} from './subscription-feedback-banner';
import { SubscriptionHeader } from './subscription-header';
import { SubscriptionSkeleton } from './subscription-skeleton';

/**
 * Signature ambient glow — one soft blue color-ellipse behind the header, giving the
 * screen on-brand depth instead of a flat page. Inert, behind content (`-z-10` in the
 * screen's isolate), desktop-gated (never a source of horizontal scroll on phones),
 * dark-mode-safe (the token has a `.dark` pair). Symmetric + centred → no mirror flip.
 */
function AmbientGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 hidden justify-center overflow-hidden lg:flex"
    >
      <div className="bg-deco-blob-blue-light mt-[-160px] h-[420px] w-[560px] rounded-full opacity-20 blur-[120px]" />
    </div>
  );
}

/**
 * TEMPORARY direction override (per request): this screen renders in STANDARD
 * direction — English LTR, Arabic RTL — instead of the app-wide inverted
 * `LOCALE_DIRECTION` mapping (en→rtl / ar→ltr, CLAUDE rule 4). Scoped to this
 * screen only; the rest of the `(app)` surface keeps the inverted mapping. Delete
 * this helper + the `dir` prop on the root to restore the canonical behaviour.
 */
function standardDir(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'en' ? 'ltr' : 'rtl';
}

/**
 * Back link to the profile hub — same style/label as the My-info screen's
 * `SettingsBackLink`. Mirrored direction utilities (`justify-start` + chevron
 * before the label + `rtl:-scale-x-100`) because this screen carries the
 * STANDARD-direction override (flipped vs the app's inverted mapping), so the
 * leading edge and back-arrow flip land on the same physical side as My-info.
 */
function SubscriptionBackLink() {
  const { t } = useTranslation();
  return (
    <nav className="flex w-full items-center justify-start">
      <Link
        href={ROUTES.DASHBOARD_SETTINGS}
        className="text-brand-dark-navy focus-visible:outline-ring inline-flex items-center gap-2 rounded text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-80"
      >
        <ChevronLeftIcon className="size-3 shrink-0 rtl:-scale-x-100" aria-hidden />
        {t('subscription.back')}
      </Link>
    </nav>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <section className="bg-card border-border flex flex-col items-center gap-3 rounded-2xl border p-8 text-center shadow-sm">
      <h2 className="text-foreground text-lg font-semibold">{t('subscription.error.title')}</h2>
      <p className="text-muted-foreground max-w-sm text-sm leading-6">
        {t('subscription.error.subtitle')}
      </p>
      <Button type="button" variant="outline" onClick={onRetry} className="mt-1">
        {t('subscription.error.retry')}
      </Button>
    </section>
  );
}

/**
 * Subscription management (`/dashboard/settings/subscriptions`) — the iOS
 * `SubscriptionManagementView`, technician-only. Reads the current subscription
 * (GET /users/subscription) and renders one of: loading skeleton, error+retry, the
 * empty "no active subscription" state, or the active plan + weekly bid-usage +
 * cancel. Client island — the `(app)` layout supplies the sidebar.
 */
export function SubscriptionScreen() {
  const { i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const subscription = useSubscription();
  const [feedback, setFeedback] = useState<SubscriptionFeedback | null>(null);

  const settled = !subscription.isPending && !subscription.isError;

  return (
    // Centred, capped column (mx-auto + max-w-2xl) so the content sits in the
    // middle of the content area and never stretches on wide monitors.
    <div
      dir={standardDir(locale)}
      className="relative isolate mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:gap-8"
    >
      <AmbientGlow />
      <SubscriptionBackLink />
      <SubscriptionHeader />

      {feedback ? (
        <SubscriptionFeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} />
      ) : null}

      {subscription.isPending ? <SubscriptionSkeleton /> : null}
      {subscription.isError ? <ErrorState onRetry={() => subscription.refetch()} /> : null}
      {settled && !subscription.data ? <NoSubscriptionEmpty /> : null}
      {subscription.data ? (
        <ActiveSubscriptionView
          subscription={subscription.data}
          locale={locale}
          onFeedback={setFeedback}
        />
      ) : null}
    </div>
  );
}
