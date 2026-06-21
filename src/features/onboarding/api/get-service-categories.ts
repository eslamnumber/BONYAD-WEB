import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { toList } from '../lib/services-list';
import type { SetupService } from '../schemas/setup';

/**
 * Shares the `['services','categories']` key with `features/dashboard`'s identical
 * fetcher (rule 6 forbids importing it across features) so the create-project picker and
 * this onboarding picker reuse one cache entry. GET /services/categories (isCategory=true).
 */
export const serviceCategoriesQueryKey = () => ['services', 'categories'] as const;

export async function getServiceCategories(): Promise<SetupService[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.SERVICES.CATEGORIES);
  return toList<SetupService>(data);
}

export function useServiceCategories() {
  return useQuery({
    queryKey: serviceCategoriesQueryKey(),
    queryFn: getServiceCategories,
    staleTime: 1000 * 60 * 30,
  });
}
