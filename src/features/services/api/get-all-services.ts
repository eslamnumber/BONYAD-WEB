import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { Service } from '../schemas/service';

import { extractServices } from './get-my-technician-services';

export const allServicesQueryKey = () => ['services', 'all'] as const;

/**
 * Every available service (categories + subcategories) — GET /services. Backs the
 * "Add services" picker: the technician chooses from these the ones they don't yet
 * offer. Mirrors the RN call site website-bonyad/src/services/ServiceService.ts:86.
 * Body is `{ services }` or a bare array; an unexpected shape yields [].
 */
export async function getAllServices(): Promise<Service[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.SERVICES.LIST);
  return extractServices(data);
}

/** Fetched only when the add picker is open (`enabled`) — the full list is large. */
export function useAllServices(enabled: boolean) {
  return useQuery({
    queryKey: allServicesQueryKey(),
    queryFn: getAllServices,
    staleTime: 1000 * 60 * 10,
    enabled,
  });
}
