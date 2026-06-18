import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { assertCardOk, cardsQueryKey } from '../lib/card-response';
import { type CardMutationResponseBody } from '../schemas/card';

/**
 * Promote a card to the default payout/payment method. Mirrors the iOS call site
 * bonayd-ios/.../Utils/TechnicianCardService.swift:245 (`setDefaultCard`) — PUT
 * /user/cards/:id/default with no body. Browser calls go through `/api/proxy/*`,
 * which attaches the session token.
 */
export async function setDefaultCard(id: number): Promise<void> {
  const data = await apiClient.put<CardMutationResponseBody>(
    API_ENDPOINTS.CARDS.SET_DEFAULT.replace(':id', String(id)),
  );
  assertCardOk(data);
}

export function useSetDefaultCard() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: setDefaultCard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cardsQueryKey() }),
  });
}
