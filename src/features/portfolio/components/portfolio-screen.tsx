'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons';
import { SettingsAmbientGlow } from '@/components/layout';
import { Button, Skeleton } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { type Locale } from '@/types/locale';

import { usePortfolio } from '../api/get-portfolio';

import { CreatePortfolioPanel } from './create-portfolio-panel';
import { PortfolioManager } from './portfolio-manager';
import { usePortfolioDir } from './use-portfolio-dir';

/**
 * Back link to the profile hub, anchored to the reading-START (`justify-start`) so —
 * under this screen's normal-dir override — it sits top-left in English and **top-right
 * in Arabic**. The chevron flips via `rtl:-scale-x-100` to always point "back" (left in
 * LTR, right in RTL). Local to portfolio because the shared SettingsBackLink is built
 * for the app's inverted map (justify-end) and would land on the wrong side here.
 */
function PortfolioBackLink({ label }: { label: string }) {
  return (
    <nav className="flex w-full items-center justify-start">
      <Link
        href={ROUTES.DASHBOARD_SETTINGS}
        className="text-brand-dark-navy focus-visible:outline-ring inline-flex items-center gap-2 rounded text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-80"
      >
        <ChevronLeftIcon className="size-3 shrink-0 rtl:-scale-x-100" aria-hidden />
        {label}
      </Link>
    </nav>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <Skeleton className="h-[180px] w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[280px] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="text-foreground text-base font-medium">{t('portfolio.error.title')}</p>
      <p className="text-muted-foreground max-w-sm text-sm">{t('portfolio.error.subtitle')}</p>
      <Button type="button" variant="outline" onClick={onRetry}>
        {t('portfolio.error.retry')}
      </Button>
    </div>
  );
}

/**
 * Technician portfolio (`/dashboard/settings/portfolio`) — the profile hub's "My
 * portfolio" row. Branches on the load: loading → error (retry) → no portfolio yet
 * (create panel) → the manager. Full-width (no side gaps); the `(app)` layout supplies
 * the sidebar. My own web design — the backend contract is the only thing taken from
 * the iOS app.
 */
export function PortfolioScreen() {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const dir = usePortfolioDir();
  const portfolio = usePortfolio();

  return (
    // `dir` overrides the app's inverted en→rtl map so this screen reads conventionally
    // (LTR in English, RTL in Arabic) — a deliberate per-screen revert (user request).
    <div dir={dir} className="relative isolate flex w-full flex-1 flex-col px-4 py-8 sm:px-6">
      <SettingsAmbientGlow />
      {/* Centered (mx-auto) + capped so the content sits in the middle of the content
          area and never stretches on wide monitors. mx-auto is direction-agnostic, so
          it centers correctly despite this screen's `dir` override. Rule 4a settings
          exception: settings sub-screens are centered, not sidebar-flush. */}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:gap-8">
        <PortfolioBackLink label={t('portfolio.back')} />
        <header>
          <h1 className="text-foreground text-start text-2xl font-semibold tracking-tight sm:text-3xl">
            {t('portfolio.title')}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-start text-sm leading-6">
            {t('portfolio.subtitle')}
          </p>
        </header>

        {portfolio.isPending ? (
          <LoadingState />
        ) : portfolio.isError ? (
          <ErrorState onRetry={() => portfolio.refetch()} />
        ) : portfolio.data === null ? (
          <CreatePortfolioPanel />
        ) : (
          <PortfolioManager portfolio={portfolio.data} locale={locale} />
        )}
      </div>
    </div>
  );
}
