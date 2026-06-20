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

type Props = {
  details: PaymentResultDetails | null;
  /** Element id the host dialog points `aria-labelledby` at (modal mode). */
  headingId?: string;
  /** When set, the card is shown as a modal on the project screen: the close-X
   *  dismisses it (no navigation) and the "View my projects" footer is dropped —
   *  the customer is already on the project. Omit it for the standalone page. */
  onClose?: () => void;
};

/**
 * Payment-confirmed card (Figma node 1553:8470): the success "Ticks" illustration,
 * a confirmation heading + the paid amount, and an operation-details summary. Shown
 * as a modal over the in-progress project screen (the customer pays and confirms in
 * place); also reused on the standalone /payment/callback page, where it keeps the
 * "View my projects" footer and the close-X links back to the projects list.
 */
export function PaymentSuccessCard({ details, headingId, onClose }: Props) {
  const { t } = useTranslation();
  return (
    <div className="bg-card relative mx-auto flex w-full max-w-[600px] flex-col items-center gap-6 rounded-3xl p-8 shadow-[0px_12px_24px_rgba(0,0,0,0.1)]">
      <CloseControl label={t('dashboard.payment.success.close')} onClose={onClose} />

      <div className="text-payment-success h-[180px] w-[189px]">
        <PaymentSuccessTicksIllustration className="size-full" aria-hidden />
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <h1 id={headingId} className="text-foreground text-[32px] font-medium">
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

      {onClose ? null : (
        <Link
          href={ROUTES.DASHBOARD_PROJECTS}
          className="bg-brand-dark-navy text-on-media focus-visible:outline-ring w-full max-w-[400px] rounded-lg p-3 text-center text-[15px] font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-90"
        >
          {t('dashboard.payment.success.viewProjects')}
        </Link>
      )}
    </div>
  );
}

/** Close affordance: a dismiss button in modal mode, else a link back to projects. */
function CloseControl({ label, onClose }: { label: string; onClose?: () => void }) {
  const className =
    'text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute start-6 top-6 rounded-lg p-1 focus-visible:ring-2 focus-visible:outline-none';
  if (onClose) {
    return (
      <button type="button" onClick={onClose} aria-label={label} className={className}>
        <X className="size-5" aria-hidden />
      </button>
    );
  }
  return (
    <Link href={ROUTES.DASHBOARD_PROJECTS} aria-label={label} className={className}>
      <X className="size-5" aria-hidden />
    </Link>
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
