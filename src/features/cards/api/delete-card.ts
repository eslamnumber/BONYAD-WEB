import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { assertCardOk, cardsQueryKey } from '../lib/card-response';
import { type CardMutationResponseBody } from '../schemas/card';

/**
 * Remove a saved card. Mirrors the iOS call site
 * bonayd-ios/.../Utils/TechnicianCardService.swift:302 (`deleteCard`) — DELETE
 * /user/cards/:id. Browser calls go through `/api/proxy/*`, which attaches the
 * session token.
 */
export async function deleteCard(id: number): Promise<void> {
  const data = await apiClient.delete<CardMutationResponseBody>(
    API_ENDPOINTS.CARDS.DELETE.replace(':id', String(id)),
  );
  assertCardOk(data);
}

export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteCard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cardsQueryKey() }),
  });
}
