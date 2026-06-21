import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  type CheckoutSession,
  type CreateCheckoutRequest,
  type CreateCheckoutResponseBody,
  createCheckoutRequestSchema,
} from '../schemas/payment';

/**
 * Throw when the backend forwarded a failure over HTTP 200 (`success: false`). A hard
 * failure arrives as HTTP 400 → ApiError before this runs. The result `code` on a
 * freshly-created checkout is `000.200.100` ("checkout created") — NOT a failure, so
 * we never gate on it here.
 */
function assertCheckoutOk(data: CreateCheckoutResponseBody): void {
  if (data.success === false) {
    throw new Error(data.error ?? data.message ?? 'Failed to create checkout');
  }
}

function resolveCheckoutId(data: CreateCheckoutResponseBody): string {
  if (!data.checkoutId) throw new Error('No checkout ID received from payment gateway');
  return data.checkoutId;
}

/** Normalise the create-checkout response into a {@link CheckoutSession} (or throw). */
function toCheckoutSession(data: CreateCheckoutResponseBody): CheckoutSession {
  assertCheckoutOk(data);
  return {
    checkoutId: resolveCheckoutId(data),
    mode: data.mode ?? null,
    expiresAt: data.expiresAt ?? null,
  };
}

/**
 * Create a HyperPay COPYandPAY checkout. POST /payments/create-checkout returns a
 * `checkoutId` the client feeds to the embedded `paymentWidgets.js` widget — the
 * backend does NOT return a hosted redirect URL (confirmed in CreateCheckoutResponse).
 * Strict request (CLAUDE rule 1), permissive response. Browser calls go through
 * `/api/proxy/*`, which attaches the session token.
 */
export async function createCheckout(input: CreateCheckoutRequest): Promise<CheckoutSession> {
  const body = createCheckoutRequestSchema.parse(input);
  const data = await apiClient.post<CreateCheckoutResponseBody>(
    API_ENDPOINTS.PAYMENT.CREATE_CHECKOUT,
    { body },
  );
  return toCheckoutSession(data);
}

export function useCreateCheckout() {
  return useMutation<CheckoutSession, Error, CreateCheckoutRequest>({ mutationFn: createCheckout });
}
