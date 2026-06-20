'use client';

import { useEffect, useRef, useState } from 'react';

import { getPaymentStatus } from '../../api/get-payment-status';
import { payPhase } from '../../api/pay-phase';
import { PENDING_CHECKOUT_KEY } from '../../lib/checkout-request';
import {
  hasPaymentReturn,
  type PaymentContext,
  resolvePaymentContext,
} from '../../lib/payment-callback';

export type PaymentResultStatus = 'verifying' | 'success' | 'failed';

export type PaymentResultDetails = {
  transactionId: string;
  amount: number | null;
  currency?: string;
  paymentBrand?: string;
  paidAt: Date;
};

function readStored(): string | null {
  try {
    return sessionStorage.getItem(PENDING_CHECKOUT_KEY);
  } catch {
    return null;
  }
}

function clearStored(): void {
  try {
    sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
  } catch {
    /* sessionStorage unavailable — nothing to clear. */
  }
}

function toNumber(value: string | number | undefined): number | null {
  if (value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Mark the phase paid after a verified charge. Non-fatal — the money already
 *  moved even if this call fails, so it never flips the result to failed (RN parity). */
async function markPhasePaid(ctx: PaymentContext, transactionRef: string): Promise<void> {
  if (!ctx.phaseId) return;
  try {
    await payPhase(ctx.phaseId, {
      paymentType: ctx.paymentType,
      ...(ctx.amount !== null ? { amount: ctx.amount } : {}),
      paymentMethod: 'CARD',
      paymentReference: transactionRef,
      gatewayTransactionId: transactionRef,
    });
  } catch {
    /* logged-and-ignored: the charge succeeded; the user can re-check from the project. */
  }
}

async function runVerification(
  setStatus: (s: PaymentResultStatus) => void,
  setDetails: (d: PaymentResultDetails) => void,
): Promise<void> {
  const ctx = resolvePaymentContext(window.location.search, readStored(), Date.now());
  if (!ctx.checkoutId) {
    setStatus('failed');
    return;
  }

  const result = await getPaymentStatus(ctx.checkoutId).catch(() => null);
  if (!result) {
    setStatus('failed');
    return;
  }
  if (!result.success) {
    setStatus(result.isPending ? 'verifying' : 'failed');
    return;
  }

  const ref = result.transactionId ?? ctx.checkoutId;
  await markPhasePaid(ctx, ref);
  clearStored();
  setDetails({
    transactionId: ref,
    amount: ctx.amount ?? toNumber(result.amount),
    currency: result.currency,
    paymentBrand: result.paymentBrand,
    paidAt: new Date(),
  });
  setStatus('success');
}

/**
 * Drives the phase-payment result (5d.4): resolve the checkout context →
 * GET /payments/status → mark the phase paid → success / failed. Runs once on
 * mount (guarded against React's double-invoke).
 *
 * Shared by the standalone /payment/callback page (default — always verifies) and
 * the in-progress project screen, which passes `requireReturnParams` so it only
 * activates when the gateway has actually redirected back (a checkout marker is in
 * the URL). `active` tells the host whether to show the result modal.
 */
export function usePaymentResult({ requireReturnParams = false } = {}) {
  const [status, setStatus] = useState<PaymentResultStatus>('verifying');
  const [details, setDetails] = useState<PaymentResultDetails | null>(null);
  // Whether a result is expected: always on the standalone page; on the project
  // screen only once the gateway has actually redirected back. Derived (no effect
  // setState) — the project screen renders client-side, so window is available.
  const [active] = useState(
    () =>
      !requireReturnParams ||
      (typeof window !== 'undefined' && hasPaymentReturn(window.location.search)),
  );
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !active) return;
    ran.current = true;
    void runVerification(setStatus, setDetails);
  }, [active]);

  return { status, details, active };
}
