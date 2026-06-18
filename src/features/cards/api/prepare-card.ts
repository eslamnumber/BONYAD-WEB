import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { assertCardOk } from '../lib/card-response';
import { type CardCheckoutSession, type PrepareCardResponseBody } from '../schemas/card';

/** A `MIMIC_…` checkout (or `environment: 'mimic'`) is a backend-simulated charge. */
function isMimic(checkoutId: string, environment?: string): boolean {
  return checkoutId.startsWith('MIMIC_') || environment === 'mimic';
}

/**
 * Open a 1 SAR HyperPay preauth checkout to register a card. Mirrors the iOS call
 * site bonayd-ios/.../Utils/TechnicianCardService.swift:55 (`prepareCardRegistration`)
 * — POST /user/cards/prepare with no body. The response is normalised for the web
 * hosted-redirect flow: `checkoutId = checkoutId ?? id`, `redirectUrl = redirectUrl
 * ?? shopperUrl` (the iOS native widget ignores the URL; the web redirects to it).
 * A `success: false` forwarded over HTTP 200 is thrown so the caller surfaces it.
 */
export async function prepareCard(): Promise<CardCheckoutSession> {
  const data = await apiClient.post<PrepareCardResponseBody>(API_ENDPOINTS.CARDS.PREPARE);
  assertCardOk(data);

  const checkoutId = data.checkoutId ?? data.id;
  if (!checkoutId) throw new Error('No checkout ID received from payment gateway');

  return {
    checkoutId,
    redirectUrl: data.redirectUrl ?? data.shopperUrl ?? null,
    environment: data.environment ?? null,
    isMimic: isMimic(checkoutId, data.environment),
  };
}

export function usePrepareCard() {
  return useMutation<CardCheckoutSession, Error, void>({ mutationFn: prepareCard });
}
