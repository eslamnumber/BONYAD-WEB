import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { assertCardOk, cardsQueryKey } from '../lib/card-response';
import { type CardListResponseBody, type PaymentCard } from '../schemas/card';

/**
 * The signed-in user's saved payment cards. Mirrors the iOS call site
 * bonayd-ios/.../Utils/TechnicianCardService.swift:174 (`getCards`) — GET
 * /user/cards, used by customers and technicians alike. Browser calls go through
 * `/api/proxy/*`, which attaches the session token. The response is permissive: a
 * bare `PaymentCard[]` or the `{ success, cards }` envelope both resolve to the list.
 */
export async function getCards(): Promise<PaymentCard[]> {
  const data = await apiClient.get<CardListResponseBody | PaymentCard[]>(API_ENDPOINTS.CARDS.LIST);
  if (Array.isArray(data)) return data;
  assertCardOk(data);
  return data.cards ?? [];
}

export function useCards() {
  return useQuery({
    queryKey: cardsQueryKey(),
    queryFn: getCards,
    staleTime: 1000 * 30,
  });
}
