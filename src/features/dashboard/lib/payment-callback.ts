/** The payment context recovered on the phase-payment return (project page / callback). */
export type PaymentContext = {
  checkoutId: string | null;
  phaseId: number | null;
  paymentType: 'FULL' | 'PARTIAL';
  amount: number | null;
  /** Explicit payment kind from the querystring — `phase` (default). */
  type: string;
};

type StoredCheckout = {
  checkoutId?: string;
  phaseId?: number;
  type?: string;
  amount?: number;
  paymentType?: 'FULL' | 'PARTIAL';
  timestamp?: number;
};

/** 30-minute TTL on the sessionStorage fallback. */
const STORED_TTL_MS = 30 * 60 * 1000;

/**
 * True when the URL carries a HyperPay return marker (a checkout id / resourcePath).
 * Distinguishes a real payment redirect from a normal visit to the project page, so
 * the in-progress screen only pops the result modal after the widget redirects the
 * browser back — never on an ordinary load (a stale sessionStorage record alone must
 * not trigger it).
 */
export function hasPaymentReturn(search: string): boolean {
  const params = new URLSearchParams(search);
  return Boolean(params.get('id') ?? params.get('checkoutId') ?? params.get('resourcePath'));
}

function numOrNull(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** The widget redirect carries `resourcePath=/v1/checkouts/{id}/payment`. */
function checkoutFromResourcePath(resourcePath: string | null): string | null {
  if (!resourcePath) return null;
  return /\/checkouts\/([^/]+)/.exec(resourcePath)?.[1] ?? null;
}

function parseStored(raw: string | null, now: number): StoredCheckout | null {
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as StoredCheckout;
    if (typeof stored.timestamp === 'number' && now - stored.timestamp > STORED_TTL_MS) return null;
    return stored;
  } catch {
    return null;
  }
}

/** First non-nullish of URL value → stored value → fallback. */
function pick<T>(fromUrl: T | null, fromStore: T | undefined, fallback: T): T {
  return fromUrl ?? fromStore ?? fallback;
}

function resolveCheckoutId(params: URLSearchParams, stored: StoredCheckout | null): string | null {
  return (
    params.get('id') ??
    params.get('checkoutId') ??
    checkoutFromResourcePath(params.get('resourcePath')) ??
    stored?.checkoutId ??
    null
  );
}

/**
 * Resolve the checkout context from the return URL, falling back to the sessionStorage
 * record the checkout flow left behind. URL params win (they travel in the widget form
 * action); the store covers a dropped querystring. `type` is read explicitly — no
 * URL-path sniffing like the RN callback.
 */
export function resolvePaymentContext(
  search: string,
  storedRaw: string | null,
  now: number,
): PaymentContext {
  const params = new URLSearchParams(search);
  const stored = parseStored(storedRaw, now);

  return {
    checkoutId: resolveCheckoutId(params, stored),
    phaseId: pick(numOrNull(params.get('phaseId')), stored?.phaseId, null),
    paymentType: pick(
      params.get('paymentType') as 'FULL' | 'PARTIAL' | null,
      stored?.paymentType,
      'FULL',
    ),
    amount: pick(numOrNull(params.get('amount')), stored?.amount, null),
    type: pick(params.get('type'), stored?.type, 'phase'),
  };
}
