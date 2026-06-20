'use client';

import { useAuthStore } from '@/stores/auth-store';

import { useCreateCheckout } from '../../api/create-checkout';
import {
  buildCheckoutRequest,
  buildShopperResultUrl,
  PENDING_CHECKOUT_KEY,
  resolveRedirectTarget,
} from '../../lib/checkout-request';
import { type ProjectPhase } from '../../schemas/project-phase';

import { type PaymentSelection } from './payment-options-modal';

/** Persist the pending checkout so /payment/callback can recover the phase context
 *  even if HyperPay drops the querystring on the return redirect. Best-effort. */
function rememberPending(
  checkoutId: string,
  phase: ProjectPhase,
  selection: PaymentSelection,
): void {
  try {
    sessionStorage.setItem(
      PENDING_CHECKOUT_KEY,
      JSON.stringify({
        checkoutId,
        phaseId: phase.id,
        type: 'phase',
        amount: selection.amount,
        paymentType: selection.paymentType,
        timestamp: Date.now(),
      }),
    );
  } catch {
    // sessionStorage unavailable — the shopperResultUrl querystring still carries it.
  }
}

/**
 * Drives the checkout step (5d.3): build the create-checkout request from the
 * signed-in user, POST it, stash the pending checkout, and redirect to HyperPay's
 * hosted page (or, in mimic mode, straight to /payment/callback). The callback
 * (5d.4) verifies the charge and marks the phase paid.
 */
export function usePhaseCheckout(projectId: number) {
  const user = useAuthStore((s) => s.user);
  const mutation = useCreateCheckout();

  const start = (phase: ProjectPhase, selection: PaymentSelection) => {
    const shopperResultUrl = buildShopperResultUrl({
      origin: window.location.origin,
      projectId,
      phaseId: phase.id,
      paymentType: selection.paymentType,
      amount: selection.amount,
    });
    const request = buildCheckoutRequest({
      phase,
      selection,
      user,
      shopperResultUrl,
      now: Date.now(),
    });
    mutation.mutate(request, {
      onSuccess: (session) => {
        rememberPending(session.checkoutId, phase, selection);
        window.location.href = resolveRedirectTarget(session, shopperResultUrl);
      },
    });
  };

  return { start, isPending: mutation.isPending, isError: mutation.isError };
}
