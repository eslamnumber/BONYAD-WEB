'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { LoadingState } from '@/components/feedback/loading-state';
import { Modal } from '@/components/ui/modal';

import { PaymentFailedCard } from '../payment-callback/payment-failed-card';
import { PaymentSuccessCard } from '../payment-callback/payment-success-card';
import {
  type PaymentResultDetails,
  type PaymentResultStatus,
} from '../payment-callback/use-payment-result';

type Props = {
  open: boolean;
  status: PaymentResultStatus;
  details: PaymentResultDetails | null;
  onClose: () => void;
};

/**
 * Phase-payment result, shown as a modal **over the in-progress project screen**
 * once the HyperPay redirect returns (Figma 1553:8142 — its full-screen scrim is the
 * dialog scrim). Verifying → success ({@link PaymentSuccessCard}, no "View my
 * projects" footer — the customer is already here) → failed. Reuses the shared
 * {@link Modal} chrome but renders each card's own surface (transparent panel).
 */
export function PhasePaymentResultModal({ open, status, details, onClose }: Props) {
  const titleId = useId();
  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className="max-w-[600px] border-0 bg-transparent p-0 shadow-none"
    >
      {status === 'verifying' ? <Verifying titleId={titleId} /> : null}
      {status === 'success' ? (
        <PaymentSuccessCard details={details} headingId={titleId} onClose={onClose} />
      ) : null}
      {status === 'failed' ? <PaymentFailedCard headingId={titleId} onClose={onClose} /> : null}
    </Modal>
  );
}

/** Verifying state — spinner + hint while the charge is confirmed. */
function Verifying({ titleId }: { titleId: string }) {
  const { t } = useTranslation();
  return (
    <div className="bg-card mx-auto flex w-full max-w-[600px] flex-col items-center gap-4 rounded-3xl p-8 text-center shadow-[0px_12px_24px_rgba(0,0,0,0.1)]">
      <LoadingState label={t('dashboard.payment.callback.verifying')} />
      <h2 id={titleId} className="text-foreground text-xl font-semibold">
        {t('dashboard.payment.callback.verifying')}
      </h2>
      <p className="text-muted-foreground text-sm">
        {t('dashboard.payment.callback.verifyingHint')}
      </p>
    </div>
  );
}
