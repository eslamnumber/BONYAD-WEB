import { type AuthUser } from '@/types/auth';

import { type CreateCheckoutRequest } from '../schemas/payment';
import { type ProjectPhase } from '../schemas/project-phase';

/** sessionStorage key the /payment/callback (+ inline result modal) use to recover
 *  the pending checkout if the gateway drops the return querystring. */
export const PENDING_CHECKOUT_KEY = 'hyperpay_pending_checkout';

type Selection = { amount: number; paymentType: 'FULL' | 'PARTIAL' };

/** Fallback e-mail when the user has none — the backend requires a valid address
 *  (`@Email @NotBlank`). A Bonyad no-reply (not a random fake) keeps records sane. */
const FALLBACK_EMAIL = 'noreply@bonyad-hub.com';

/** Split a display name into HyperPay's givenName / surname. The backend rejects a
 *  blank surname (@NotBlank), so a single-word name reuses givenName as the surname. */
function splitName(name: string | undefined): { givenName: string; surname: string } {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  const givenName = parts[0] ?? 'User';
  const surname = parts.slice(1).join(' ') || givenName;
  return { givenName, surname };
}

/** HyperPay billing defaults — the auth user has no address fields, so every checkout
 *  shares one default address (single source). */
const DEFAULT_BILLING = {
  street1: 'King Fahd Road',
  city: 'Riyadh',
  state: 'Riyadh',
  country: 'SA',
  postcode: '12345',
} as const;

/**
 * The widget's return URL (the COPYandPAY form `action`): the project detail page,
 * carrying the phase context the in-progress screen reads back
 * (`?type=phase&phaseId=&paymentType=&amount=`). After the widget processes the card it
 * redirects here, appending `&resourcePath=/v1/checkouts/{id}/payment`; the inline
 * result modal then verifies the charge (the status GET finalizes it server-side).
 */
export function buildShopperResultUrl(opts: {
  origin: string;
  projectId: number;
  phaseId: number;
  paymentType: 'FULL' | 'PARTIAL';
  amount: number;
}): string {
  const params = new URLSearchParams({
    type: 'phase',
    phaseId: String(opts.phaseId),
    paymentType: opts.paymentType,
    amount: String(opts.amount),
  });
  return `${opts.origin}/dashboard/projects/${opts.projectId}?${params.toString()}`;
}

/**
 * Build the POST /payments/create-checkout body for a phase payment. Customer identity
 * comes from the signed-in user (with backend-safe fallbacks for a blank email/surname);
 * billing uses the shared default. `paymentType: 'DB'` is the HyperPay txn type — the
 * FULL/PARTIAL split rides in merchantTransactionId + the widget form action.
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
    customer: { email: user?.email || FALLBACK_EMAIL, givenName, surname },
    billing: DEFAULT_BILLING,
    shopperResultUrl,
  };
}
