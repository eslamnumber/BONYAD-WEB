'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { PaymentSuccessTicksIllustration } from '@/components/illustrations';
import { ROUTES } from '@/config/routes';

import {
  PaymentSummaryCard,
  SummaryRow,
} from '../customer-in-progress-detail/payment-summary-card';
import { MoneyAmount } from '../money-amount';

import { type PaymentResultDetails } from './use-payment-result';

const DASH = '—';

/**
 * Payment-confirmed card (Figma node 1553:8470): the success "Ticks" illustration,
 * a confirmation heading + the paid amount, an operation-details summary, and a way
 * back to the projects. Rendered centred on the /payment/callback page (the Figma's
 * full-screen scrim becomes the page background). The Figma "Download receipt (PDF)"
 * footer is replaced by "View my projects" — there is no receipt endpoint yet.
 */
export function PaymentSuccessCard({ details }: { details: PaymentResultDetails | null }) {
  const { t } = useTranslation();
  return (
    <div className="bg-card relative mx-auto flex w-full max-w-[600px] flex-col items-center gap-6 rounded-3xl p-8 shadow-[0px_12px_24px_rgba(0,0,0,0.1)]">
      <Link
        href={ROUTES.DASHBOARD_PROJECTS}
        aria-label={t('dashboard.payment.success.close')}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute start-6 top-6 rounded-lg p-1 focus-visible:ring-2 focus-visible:outline-none"
      >
        <X className="size-5" aria-hidden />
      </Link>

      <div className="text-payment-success h-[180px] w-[189px]">
        <PaymentSuccessTicksIllustration className="size-full" aria-hidden />
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-foreground text-[32px] font-medium">
          {t('dashboard.payment.success.heading')}
        </h1>
        <p dir="auto" className="text-foreground text-base">
          {t('dashboard.payment.success.subtitle')}
        </p>
        {details && details.amount !== null ? (
          <span className="text-payment-success text-base font-semibold">
            <MoneyAmount value={details.amount} />
          </span>
        ) : null}
      </div>

      <SuccessDetails details={details} />

      <Link
        href={ROUTES.DASHBOARD_PROJECTS}
        className="bg-brand-dark-navy text-on-media focus-visible:outline-ring w-full max-w-[400px] rounded-lg p-3 text-center text-[15px] font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-90"
      >
        {t('dashboard.payment.success.viewProjects')}
      </Link>
    </div>
  );
}

function SuccessDetails({ details }: { details: PaymentResultDetails | null }) {
  const { t, i18n } = useTranslation();
  if (!details) return null;

  const date = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(details.paidAt);

  return (
    <div className="w-full max-w-[400px]">
      <PaymentSummaryCard heading={t('dashboard.payment.success.detailsHeading')}>
        <SummaryRow label={t('dashboard.payment.success.transactionId')}>
          {details.transactionId}
        </SummaryRow>
        <SummaryRow label={t('dashboard.payment.success.amount')}>
          {details.amount !== null ? <MoneyAmount value={details.amount} /> : DASH}
        </SummaryRow>
        <SummaryRow label={t('dashboard.payment.success.method')}>
          {details.paymentBrand ?? DASH}
        </SummaryRow>
        <SummaryRow label={t('dashboard.payment.success.date')}>{date}</SummaryRow>
      </PaymentSummaryCard>
    </div>
  );
}
