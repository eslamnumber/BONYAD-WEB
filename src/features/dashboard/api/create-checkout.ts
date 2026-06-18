import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  type CheckoutSession,
  type CreateCheckoutRequest,
  type CreateCheckoutResponseBody,
  createCheckoutRequestSchema,
} from '../schemas/payment';

/** A `MIMIC_…` checkout (or `environment: 'mimic'`) is a backend-simulated charge. */
function isMimic(checkoutId: string, environment?: string): boolean {
  return checkoutId.startsWith('MIMIC_') || environment === 'mimic';
}

/**
 * Throw when the backend forwarded a HyperPay failure over HTTP 200 — either a
 * `result.code` that doesn't start with '000.', or an explicit `success: false`.
 */
function assertCheckoutOk(data: CreateCheckoutResponseBody): void {
  const code = data.result?.code;
  const failed = (code !== undefined && !code.startsWith('000.')) || data.success === false;
  if (failed) {
    const reason = data.result?.description ?? data.error ?? data.message;
    throw new Error(reason ?? 'Failed to create checkout');
  }
}

/** Resolve the checkout id across the backend's response shapes (or throw). */
function resolveCheckoutId(data: CreateCheckoutResponseBody): string {
  const checkoutId = data.checkoutId ?? data.id ?? data.ndc;
  if (!checkoutId) throw new Error('No checkout ID received from payment gateway');
  return checkoutId;
}

/**
 * Create a HyperPay checkout for a phase payment. Mirrors the RN call sites
 * website-bonyad/src/services/HyperPayService.ts:120 +
 * website-bonyad/src/screens/projects/in-progress/hooks/usePayment.ts:36 — POST
 * /payments/create-checkout. The request is zod-validated (CLAUDE rule 1); the
 * response is permissive and normalised here: `checkoutId = checkoutId ?? id ??
 * ndc`, `redirectUrl = redirectUrl ?? shopperUrl`. A HyperPay error forwarded over
 * HTTP 200 (`result.code` not '000.…', or `success === false`) is thrown so the
 * caller surfaces it instead of redirecting to a dead URL. Browser calls go
 * through `/api/proxy/*`, which attaches the session token.
 */
export async function createCheckout(input: CreateCheckoutRequest): Promise<CheckoutSession> {
  const body = createCheckoutRequestSchema.parse(input);
  const data = await apiClient.post<CreateCheckoutResponseBody>(
    API_ENDPOINTS.PAYMENT.CREATE_CHECKOUT,
    { body },
  );

  assertCheckoutOk(data);
  const checkoutId = resolveCheckoutId(data);

  return {
    checkoutId,
    redirectUrl: data.redirectUrl ?? data.shopperUrl ?? null,
    environment: data.environment ?? null,
    isMimic: isMimic(checkoutId, data.environment),
  };
}

export function useCreateCheckout() {
  return useMutation<CheckoutSession, Error, CreateCheckoutRequest>({ mutationFn: createCheckout });
}
