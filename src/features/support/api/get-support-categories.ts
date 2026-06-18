import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { categoriesQueryKey } from '../lib/ticket-format';
import { type CategoryHierarchyBody, type SupportCategory } from '../schemas/ticket';

/**
 * Support category tree for the new-ticket pickers. GET /support/categories/hierarchy
 * (public). Permissive: bare array or `{ categories }` / `{ data }` envelope; an
 * empty/failed fetch degrades to no category picker (rule 1).
 */
export async function getSupportCategories(): Promise<SupportCategory[]> {
  const data = await apiClient.get<CategoryHierarchyBody>(
    API_ENDPOINTS.SUPPORT.CATEGORIES_HIERARCHY,
  );
  if (Array.isArray(data)) return data;
  return data.categories ?? data.data ?? [];
}

export function useSupportCategories() {
  return useQuery({
    queryKey: categoriesQueryKey(),
    queryFn: getSupportCategories,
    staleTime: 1000 * 60 * 5,
  });
}
