import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { toList } from '../lib/services-list';
import type { SetupPlan } from '../schemas/setup';

/**
 * Shares the `['subscription-plans']` key with `features/home`'s identical fetcher
 * (rule 6 forbids importing it across features) so the for-pros pricing fetch and this
 * onboarding fetch reuse one cache entry.
 */
export const subscriptionPlansQueryKey = () => ['subscription-plans'] as const;

/** All subscription plans/tiers — the post-approval onboarding plan picker. */
export async function getSubscriptionPlans(): Promise<SetupPlan[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.SUBSCRIPTIONS.CATEGORIES);
  return toList<SetupPlan>(data);
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: subscriptionPlansQueryKey(),
    queryFn: getSubscriptionPlans,
    staleTime: 1000 * 60 * 60,
  });
}
