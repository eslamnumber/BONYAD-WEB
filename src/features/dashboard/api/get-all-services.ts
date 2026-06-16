import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { Service } from '../schemas/service';

export const allServicesQueryKey = () => ['services', 'all'] as const;

/**
 * ALL services — categories AND subcategories — for the customer dashboard search
 * typeahead. Mirrors the RN call site
 * website-bonyad/src/services/ServiceService.ts:80 (`getAllServices`) — GET
 * /services. Distinct from `getServices` (GET /services/categories, categories
 * only) so the create-project picker keeps its category-only list while search
 * can match subcategories too. Browser calls go through `/api/proxy/*`, which
 * attaches the session token. Returns the bare `Service[]`; a Spring page
 * envelope is unwrapped, and an unexpected shape yields [].
 */
export async function getAllServices(): Promise<Service[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.SERVICES.LIST);
  return extractServices(data);
}

function extractServices(data: unknown): Service[] {
  if (Array.isArray(data)) return data as Service[];
  if (data && typeof data === 'object') {
    const content = (data as { content?: unknown }).content;
    if (Array.isArray(content)) return content as Service[];
  }
  return [];
}

/**
 * Cached for 30 min — the service catalogue is effectively static across a
 * session, so the typeahead filters this list locally instead of refetching.
 */
export function useAllServices() {
  return useQuery({
    queryKey: allServicesQueryKey(),
    queryFn: getAllServices,
    staleTime: 1000 * 60 * 30,
  });
}
