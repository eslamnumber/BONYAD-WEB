import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { SubscriptionPlan } from '../schemas/subscription-plan';

export const subscriptionPlansQueryKey = () => ['subscription-plans'] as const;

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  return apiClient.get<SubscriptionPlan[]>(API_ENDPOINTS.SUBSCRIPTIONS.CATEGORIES);
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: subscriptionPlansQueryKey(),
    queryFn: getSubscriptionPlans,
    staleTime: 1000 * 60 * 60,
  });
}
