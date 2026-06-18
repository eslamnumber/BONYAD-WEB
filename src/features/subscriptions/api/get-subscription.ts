import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';

import type { Subscription } from '../schemas/subscription';

export const subscriptionQueryKey = () => ['subscription'] as const;

/**
 * Whether a status payload represents a live subscription. Active when the backend
 * says so explicitly, or when a plan category is joined (covers the brief window
 * right after activation where `hasActiveSubscription` is true but the category is
 * still hydrating). An explicit `hasActiveSubscription: false` is always inactive.
 */
export function isActiveSubscription(data: Subscription | null | undefined): boolean {
  if (!data) return false;
  if (data.hasActiveSubscription === false) return false;
  return data.hasActiveSubscription === true || Boolean(data.subscriptionCategory);
}

/**
 * The signed-in technician's current subscription. Mirrors the RN call site
 * website-bonyad/src/components/profile/SubscriptionCard.tsx:102 (and the iOS
 * `fetchSubscription`) — GET /users/subscription. Browser calls go through
 * `/api/proxy/*`, which attaches the session token.
 *
 * A **404 means "no active subscription"** — it resolves to `null` (the empty
 * state), never an error. A 2xx body that explicitly reports
 * `hasActiveSubscription: false` is also folded to `null`. Any other non-2xx
 * surfaces as an `ApiError` for the error state.
 */
export async function getSubscription(): Promise<Subscription | null> {
  try {
    const data = await apiClient.get<Subscription>(API_ENDPOINTS.USERS.SUBSCRIPTION);
    return isActiveSubscription(data) ? data : null;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export function useSubscription() {
  return useQuery({
    queryKey: subscriptionQueryKey(),
    queryFn: getSubscription,
    staleTime: 1000 * 30,
  });
}
