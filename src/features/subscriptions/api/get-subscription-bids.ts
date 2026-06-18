import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { SubscriptionBids } from '../schemas/subscription';

export const subscriptionBidsQueryKey = () => ['subscription', 'bids'] as const;

/**
 * Weekly bid quota for the active subscription. Mirrors the RN call site
 * website-bonyad/src/components/profile/SubscriptionCard.tsx:131 — GET
 * /users/subscription/bids. Browser calls go through `/api/proxy/*`, which attaches
 * the session token.
 *
 * Non-critical: the RN/iOS clients treat a failure here as a soft miss (the
 * bid-usage card is simply omitted), so the screen never blocks on it.
 */
export async function getSubscriptionBids(): Promise<SubscriptionBids> {
  return apiClient.get<SubscriptionBids>(API_ENDPOINTS.USERS.SUBSCRIPTION_BIDS);
}

export function useSubscriptionBids(enabled = true) {
  return useQuery({
    queryKey: subscriptionBidsQueryKey(),
    queryFn: getSubscriptionBids,
    enabled,
    staleTime: 1000 * 30,
    retry: false,
  });
}
