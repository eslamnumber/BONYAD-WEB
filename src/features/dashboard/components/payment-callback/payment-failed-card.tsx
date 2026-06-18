'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';

/** Payment-failed / could-not-verify state for the /payment/callback page. */
export function PaymentFailedCard() {
  const { t } = useTranslation();
  return (
    <div className="bg-card mx-auto flex w-full max-w-[600px] flex-col items-center gap-6 rounded-3xl p-8 text-center shadow-[0px_12px_24px_rgba(0,0,0,0.1)]">
      <span className="bg-status-rejected/10 text-status-rejected flex size-20 items-center justify-center rounded-full">
        <AlertCircle className="size-10" aria-hidden />
      </span>
      <div className="flex flex-col gap-3">
        <h1 className="text-foreground text-2xl font-medium">
          {t('dashboard.payment.failed.heading')}
        </h1>
        <p dir="auto" className="text-muted-foreground text-base">
          {t('dashboard.payment.failed.subtitle')}
        </p>
      </div>
      <Link
        href={ROUTES.DASHBOARD_PROJECTS}
        className="bg-brand-dark-navy text-on-media focus-visible:outline-ring w-full max-w-[400px] rounded-lg p-3 text-center text-[15px] font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-90"
      >
        {t('dashboard.payment.failed.back')}
      </Link>
    </div>
  );
}
