import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { toList } from '../lib/services-list';
import type { SetupService } from '../schemas/setup';

export const serviceSubcategoriesQueryKey = (categoryId: number) =>
  ['services', 'subcategories', categoryId] as const;

/** Subcategories (leaf services) of a category. GET /services/:categoryId/subcategories. */
export async function getServiceSubcategories(categoryId: number): Promise<SetupService[]> {
  const path = API_ENDPOINTS.SERVICES.SUBCATEGORIES.replace(':categoryId', String(categoryId));
  const data = await apiClient.get<unknown>(path);
  return toList<SetupService>(data);
}

/** Lazy — only fetched once a category row is expanded (`enabled`). */
export function useServiceSubcategories(categoryId: number, enabled: boolean) {
  return useQuery({
    queryKey: serviceSubcategoriesQueryKey(categoryId),
    queryFn: () => getServiceSubcategories(categoryId),
    enabled,
    staleTime: 1000 * 60 * 30,
  });
}
