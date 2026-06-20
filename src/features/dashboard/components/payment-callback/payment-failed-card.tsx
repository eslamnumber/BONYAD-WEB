'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';

type Props = {
  /** Element id the host dialog points `aria-labelledby` at (modal mode). */
  headingId?: string;
  /** When set, the card is a modal on the project screen: the action dismisses it
   *  (stay on the project to retry) rather than linking back to the projects list. */
  onClose?: () => void;
};

/** Payment-failed / could-not-verify state — modal over the project screen (dismiss
 *  to retry) or the standalone /payment/callback page (link back to projects). */
export function PaymentFailedCard({ headingId, onClose }: Props) {
  const { t } = useTranslation();
  const actionClassName =
    'bg-brand-dark-navy text-on-media focus-visible:outline-ring w-full max-w-[400px] rounded-lg p-3 text-center text-[15px] font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-90';
  return (
    <div className="bg-card mx-auto flex w-full max-w-[600px] flex-col items-center gap-6 rounded-3xl p-8 text-center shadow-[0px_12px_24px_rgba(0,0,0,0.1)]">
      <span className="bg-status-rejected/10 text-status-rejected flex size-20 items-center justify-center rounded-full">
        <AlertCircle className="size-10" aria-hidden />
      </span>
      <div className="flex flex-col gap-3">
        <h1 id={headingId} className="text-foreground text-2xl font-medium">
          {t('dashboard.payment.failed.heading')}
        </h1>
        <p dir="auto" className="text-muted-foreground text-base">
          {t('dashboard.payment.failed.subtitle')}
        </p>
      </div>
      {onClose ? (
        <button type="button" onClick={onClose} className={actionClassName}>
          {t('dashboard.payment.failed.dismiss')}
        </button>
      ) : (
        <Link href={ROUTES.DASHBOARD_PROJECTS} className={actionClassName}>
          {t('dashboard.payment.failed.back')}
        </Link>
      )}
    </div>
  );
}
