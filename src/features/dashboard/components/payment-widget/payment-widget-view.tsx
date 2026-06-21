'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { LockIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { conventionalDirection, type Locale } from '@/types/locale';

import { buildShopperResultUrl } from '../../lib/checkout-request';
import { WIDGET_BRANDS } from '../../lib/hyperpay-widget';
import { MoneyAmount } from '../money-amount';

import { useHyperPayWidget } from './use-hyperpay-widget';

/**
 * HyperPay COPYandPAY widget page (`/payment/checkout`) — a standalone, Bonyad-branded
 * secure-payment card. Mounts the embedded card widget (themed via `payment-widget.css`)
 * and points its `<form action>` at the project page, where the inline result modal
 * verifies after the widget redirects back.
 *
 * **Direction override:** this transactional screen renders in the **conventional**
 * mapping (en→ltr, ar→rtl) via `dir={conventionalDirection(locale)}` — a scoped exception
 * to the project's inverted `LOCALE_DIRECTION`, so the page reads the same way as the
 * embedded card widget (same pattern as the support / feedback flows). Content anchors to
 * the reading-start edge via `text-start` / `items-start`.
 */
export function PaymentWidgetView() {
  const { t, i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const sp = useSearchParams();
  const checkoutId = sp.get('checkoutId');
  const mode = sp.get('mode');
  const projectId = Number(sp.get('projectId'));
  const phaseId = Number(sp.get('phaseId'));
  const amount = Number(sp.get('amount'));
  const paymentType = sp.get('paymentType') === 'PARTIAL' ? 'PARTIAL' : 'FULL';

  useHyperPayWidget(checkoutId, mode, i18n.language);

  const valid =
    Boolean(checkoutId) &&
    Number.isFinite(projectId) &&
    Number.isFinite(phaseId) &&
    Number.isFinite(amount);
  if (!valid) return <MissingCheckout locale={locale} />;

  // Relative action (no `window.location.origin`) so the server + client render identical
  // markup — the widget resolves it against the page origin at submit time.
  const formAction = buildShopperResultUrl({ origin: '', projectId, phaseId, paymentType, amount });

  return (
    <main
      dir={conventionalDirection(locale)}
      className="relative isolate flex min-h-[100dvh] w-full flex-col items-center justify-center px-4 py-10"
    >
      <Glow />
      <section className="bg-card border-border w-full max-w-md overflow-hidden rounded-2xl border shadow-[0px_12px_40px_rgba(0,0,0,0.08)]">
        <PaymentHeader />
        <div className="bg-field-surface flex items-center justify-between gap-3 px-6 py-4">
          <span className="text-muted-foreground text-sm font-medium">
            {t('dashboard.payment.widget.amountLabel')}
          </span>
          <span className="text-foreground text-lg font-bold">
            <MoneyAmount value={amount} />
          </span>
        </div>
        {/* COPYandPAY mount point — paymentWidgets.js replaces this with the themed form. */}
        <div className="px-6 py-6">
          <form action={formAction} className="paymentWidgets" data-brands={WIDGET_BRANDS} />
        </div>
        <SecureFooter projectId={projectId} />
      </section>
    </main>
  );
}

function PaymentHeader() {
  const { t } = useTranslation();
  return (
    <header className="border-border flex flex-col items-start gap-3 border-b px-6 py-5">
      <span className="bg-brand-dark-navy/10 text-brand-dark-navy flex size-11 items-center justify-center rounded-xl">
        <LockIcon className="size-5" aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="text-foreground text-start text-lg font-semibold">
          {t('dashboard.payment.widget.title')}
        </h1>
        <p className="text-muted-foreground text-start text-sm" dir="auto">
          {t('dashboard.payment.widget.subtitle')}
        </p>
      </div>
    </header>
  );
}

function SecureFooter({ projectId }: { projectId: number }) {
  const { t } = useTranslation();
  return (
    <footer className="border-border flex flex-col items-center gap-3 border-t px-6 py-4 text-center">
      <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-xs">
        <LockIcon className="size-3.5 shrink-0" aria-hidden />
        <span dir="auto">{t('dashboard.payment.widget.secureNote')}</span>
      </p>
      <Link
        href={ROUTES.DASHBOARD_PROJECT(String(projectId))}
        className="text-muted-foreground hover:text-foreground focus-visible:outline-ring rounded text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t('dashboard.payment.widget.cancel')}
      </Link>
    </footer>
  );
}

/** Signature Bonyad glow — a soft blue ellipse behind the card. Inert, desktop-gated. */
function Glow() {
  return (
    <div
      aria-hidden
      className="bg-deco-blob-blue-light pointer-events-none absolute inset-0 -z-10 m-auto hidden h-[420px] w-[520px] rounded-full opacity-20 blur-[110px] sm:block"
    />
  );
}

/** Shown when the widget page is opened without a valid checkout context. */
function MissingCheckout({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  return (
    <main
      dir={conventionalDirection(locale)}
      className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <h1 className="text-foreground text-lg font-semibold">
        {t('dashboard.payment.widget.missingTitle')}
      </h1>
      <p className="text-muted-foreground text-sm" dir="auto">
        {t('dashboard.payment.widget.missingSubtitle')}
      </p>
      <Link
        href={ROUTES.DASHBOARD_PROJECTS}
        className="text-brand-dark-navy text-sm font-semibold underline-offset-4 hover:underline"
      >
        {t('dashboard.payment.widget.back')}
      </Link>
    </main>
  );
}
