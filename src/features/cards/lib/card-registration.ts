import { ROUTES } from '@/config/routes';

import { type CardCheckoutSession } from '../schemas/card';

/** sessionStorage key holding the pending checkout id across the HyperPay redirect. */
export const PENDING_CARD_CHECKOUT_KEY = 'bonyad_pending_card_checkout';

/** Querystring flag the cards page reads on the HyperPay return to run completion. */
export const CARD_RETURN_PARAM = 'registration';
export const CARD_RETURN_VALUE = 'return';

/**
 * Where HyperPay sends the shopper back after the 1 SAR preauth: the cards page
 * itself, flagged so {@link resolveReturnCheckoutId} knows to complete the
 * registration. Same-origin, so it survives the round-trip through the gateway.
 */
export function buildCardReturnUrl(origin: string): string {
  return `${origin}${ROUTES.DASHBOARD_SETTINGS_CARDS}?${CARD_RETURN_PARAM}=${CARD_RETURN_VALUE}`;
}

/**
 * Where to send the browser after `prepare`: the gateway's hosted page for a real
 * preauth, or — in mimic mode / when no hosted URL is returned — straight back to the
 * cards page with the checkoutId so it can complete registration. Mirrors the phase
 * payment's `resolveRedirectTarget`.
 */
export function resolveCardRedirectTarget(session: CardCheckoutSession, returnUrl: string): string {
  if (session.isMimic || !session.redirectUrl) {
    const sep = returnUrl.includes('?') ? '&' : '?';
    return `${returnUrl}${sep}id=${encodeURIComponent(session.checkoutId)}`;
  }
  return session.redirectUrl;
}

function safeSession(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function storePendingCheckout(checkoutId: string): void {
  safeSession()?.setItem(PENDING_CARD_CHECKOUT_KEY, checkoutId);
}

export function clearPendingCheckout(): void {
  safeSession()?.removeItem(PENDING_CARD_CHECKOUT_KEY);
}

/**
 * Recover the checkout id on the HyperPay return: from the echoed `?id=`/`?checkoutId=`
 * params first, then the stored fallback (set before the redirect). Returns null
 * unless the page was actually reached as a registration return — a plain visit to
 * the cards page must not trigger completion.
 */
export function resolveReturnCheckoutId(search: string, stored: string | null): string | null {
  const params = new URLSearchParams(search);
  const fromQuery = params.get('id') ?? params.get('checkoutId');
  if (fromQuery) return fromQuery;
  if (params.get(CARD_RETURN_PARAM) === CARD_RETURN_VALUE && stored) return stored;
  return null;
}
