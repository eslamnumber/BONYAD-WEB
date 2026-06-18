import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { assertCardOk, cardsQueryKey, extractCard } from '../lib/card-response';
import {
  type CardMutationResponseBody,
  type CompleteCardRequest,
  completeCardRequestSchema,
  type PaymentCard,
} from '../schemas/card';

/**
 * Finish card registration after the shopper completes the 1 SAR preauth: tokenise
 * the card and reverse the charge. Mirrors the iOS call site
 * bonayd-ios/.../Utils/TechnicianCardService.swift:114 (`completeCardRegistration`)
 * — POST /user/cards/complete with `{ checkoutId }`. The request is zod-validated;
 * the response is permissive and the saved card returned (or null when omitted).
 */
export async function completeCard(input: CompleteCardRequest): Promise<PaymentCard | null> {
  const body = completeCardRequestSchema.parse(input);
  const data = await apiClient.post<CardMutationResponseBody>(API_ENDPOINTS.CARDS.COMPLETE, {
    body,
  });
  assertCardOk(data);
  return extractCard(data);
}

export function useCompleteCard() {
  const queryClient = useQueryClient();
  return useMutation<PaymentCard | null, Error, CompleteCardRequest>({
    mutationFn: completeCard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cardsQueryKey() }),
  });
}
