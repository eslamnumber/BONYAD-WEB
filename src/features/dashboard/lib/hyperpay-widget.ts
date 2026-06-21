import { env } from '@/config/env';

/** OPP COPYandPAY widget hosts — must match the host that issued the checkoutId.
 *  Mirrors the backend constants (HyperPayService.java:38,43). */
const HOSTS = {
  TEST: 'https://eu-test.oppwa.com',
  LIVE: 'https://eu-prod.oppwa.com',
} as const;

/** Card brands the widget offers (`data-brands`) — what the cards entityId is
 *  configured for on the HyperPay account (MADA / VISA / Mastercard / Amex). Apple Pay
 *  + STC Pay are out of scope (separate entity / not implemented backend-side). */
export const WIDGET_BRANDS = 'MADA VISA MASTER AMEX';

/**
 * Resolve the OPP widget host. Prefer the backend `mode` on the create-checkout
 * response (the admin `payment_mode` toggle is the only authoritative source); fall
 * back to `env.NEXT_PUBLIC_HYPERPAY_MODE` only until the backend serializes `mode`
 * (warns so the fallback is never silently relied on in prod).
 */
export function resolveWidgetHost(mode: string | null | undefined): string {
  if (!mode) {
    console.warn(
      '[hyperpay] create-checkout response had no `mode`; using env NEXT_PUBLIC_HYPERPAY_MODE fallback',
    );
  }
  const resolved = (mode ?? env.NEXT_PUBLIC_HYPERPAY_MODE ?? 'TEST').toUpperCase();
  return resolved === 'LIVE' ? HOSTS.LIVE : HOSTS.TEST;
}

/** The COPYandPAY widget script URL for a checkout. */
export function widgetScriptUrl(host: string, checkoutId: string): string {
  return `${host}/v1/paymentWidgets.js?checkoutId=${encodeURIComponent(checkoutId)}`;
}
