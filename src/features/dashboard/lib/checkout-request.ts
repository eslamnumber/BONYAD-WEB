import { type AuthUser } from '@/types/auth';

import { type CheckoutSession, type CreateCheckoutRequest } from '../schemas/payment';
import { type ProjectPhase } from '../schemas/project-phase';

/** sessionStorage key the /payment/callback uses to recover the pending checkout. */
export const PENDING_CHECKOUT_KEY = 'hyperpay_pending_checkout';

type Selection = { amount: number; paymentType: 'FULL' | 'PARTIAL' };

/** Split a display name into HyperPay's givenName / surname (RN parity). */
function splitName(name: string | undefined): { givenName: string; surname: string } {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  return { givenName: parts[0] ?? 'User', surname: parts.slice(1).join(' ') };
}

/**
 * The /payment/callback return URL carrying the phase context HyperPay echoes back
 * (`?type=phase&phaseId=&paymentType=&amount=`). The callback reads these to mark
 * the phase paid. Mirrors website-bonyad/.../PhasePaymentModal.tsx:302.
 */
export function buildShopperResultUrl(
  origin: string,
  phaseId: number,
  paymentType: 'FULL' | 'PARTIAL',
  amount: number,
): string {
  const params = new URLSearchParams({
    type: 'phase',
    phaseId: String(phaseId),
    paymentType,
    amount: String(amount),
  });
  return `${origin}/payment/callback?${params.toString()}`;
}

/**
 * Build the POST /payments/create-checkout body for a phase payment. Customer
 * identity comes from the signed-in user; billing uses the RN defaults (the auth
 * user has no address fields). `paymentType: 'DB'` is the HyperPay txn type — the
 * FULL/PARTIAL split rides in the merchantTransactionId + shopperResultUrl. Mirrors
 * website-bonyad/src/screens/projects/in-progress/hooks/usePayment.ts:36.
 */
export function buildCheckoutRequest(opts: {
  phase: ProjectPhase;
  selection: Selection;
  user: Pick<AuthUser, 'email' | 'name'> | null;
  shopperResultUrl: string;
  now: number;
}): CreateCheckoutRequest {
  const { phase, selection, user, shopperResultUrl, now } = opts;
  const { givenName, surname } = splitName(user?.name);
  return {
    phaseId: phase.id,
    amount: selection.amount,
    currency: 'SAR',
    paymentType: 'DB',
    paymentBrand: 'MADA',
    merchantTransactionId: `PHASE-${phase.id}-${selection.paymentType}-${now}`,
    customer: { email: user?.email ?? '', givenName, surname },
    billing: {
      street1: 'King Fahd Road',
      city: 'Riyadh',
      state: 'Riyadh',
      country: 'SA',
      postcode: '12345',
    },
    shopperResultUrl,
  };
}

/**
 * Where to send the browser after a checkout is created: the gateway's hosted page
 * for a real charge, or — in mimic mode / when no hosted URL is returned — straight
 * to the callback with the checkoutId so it can verify + mark the phase paid.
 */
export function resolveRedirectTarget(session: CheckoutSession, shopperResultUrl: string): string {
  if (session.isMimic || !session.redirectUrl) {
    const sep = shopperResultUrl.includes('?') ? '&' : '?';
    return `${shopperResultUrl}${sep}id=${encodeURIComponent(session.checkoutId)}`;
  }
  return session.redirectUrl;
}
