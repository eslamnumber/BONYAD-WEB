'use client';

import { useTranslation } from 'react-i18next';

import { LoadingState } from '@/components/feedback/loading-state';

import { PaymentFailedCard } from './payment-failed-card';
import { PaymentSuccessCard } from './payment-success-card';
import { usePaymentResult } from './use-payment-result';

/**
 * HyperPay return landing (Figma "Dashboard-Payment Confirmed" 1553:8142). Reads
 * the `?type=phase&phaseId=&paymentType=&amount=&id=` querystring (sessionStorage
 * fallback), verifies the charge (GET /payments/status), marks the phase paid (POST
 * /phases/:id/pay), then shows the success card (Ticks + transaction summary) or a
 * failed state — both routing back to the projects list.
 */
export function PaymentCallbackView() {
  const { status, details } = usePaymentResult();
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-16">
      {status === 'verifying' ? <Verifying /> : null}
      {status === 'success' ? <PaymentSuccessCard details={details} /> : null}
      {status === 'failed' ? <PaymentFailedCard /> : null}
    </main>
  );
}

function Verifying() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <LoadingState label={t('dashboard.payment.callback.verifying')} />
      <h1 className="text-foreground text-xl font-semibold">
        {t('dashboard.payment.callback.verifying')}
      </h1>
      <p className="text-muted-foreground text-sm">
        {t('dashboard.payment.callback.verifyingHint')}
      </p>
    </div>
  );
}
