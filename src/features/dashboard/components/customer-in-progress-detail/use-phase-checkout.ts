'use client';

import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/auth-store';

import { useCreateCheckout } from '../../api/create-checkout';
import {
  buildCheckoutRequest,
  buildShopperResultUrl,
  PENDING_CHECKOUT_KEY,
} from '../../lib/checkout-request';
import { type ProjectPhase } from '../../schemas/project-phase';

import { type PaymentSelection } from './payment-options-modal';

/** Persist the pending checkout so the return (project page / callback) can recover the
 *  phase context even if the widget redirect drops the querystring. Best-effort. */
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
    // sessionStorage unavailable — the widget form action still carries the context.
  }
}

/**
 * Drives the checkout step: build the create-checkout request from the signed-in user,
 * POST it, stash the pending checkout, then navigate to the standalone COPYandPAY
 * **widget page** ({@link ROUTES.PAYMENT_CHECKOUT}) carrying the checkoutId + mode +
 * phase context. The widget collects the card and redirects back to the project page,
 * where the inline result modal verifies the charge (the status GET finalizes it
 * server-side). Replaces the old broken "redirect to a gateway URL" — the backend
 * returns a checkoutId for the embedded widget, never a hosted redirect URL.
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
        window.location.href = ROUTES.PAYMENT_CHECKOUT({
          checkoutId: session.checkoutId,
          mode: session.mode,
          projectId,
          phaseId: phase.id,
          paymentType: selection.paymentType,
          amount: selection.amount,
        });
      },
    });
  };

  return { start, isPending: mutation.isPending, isError: mutation.isError };
}
