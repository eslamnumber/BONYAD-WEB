import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { Service } from '../schemas/service';

export const servicesQueryKey = () => ['services', 'categories'] as const;

/**
 * Service categories for the create-project category picker. Mirrors the RN call
 * site website-bonyad/src/services/ServiceService.ts:116 (`getCategories`) —
 * GET /services/categories (isCategory=true). Browser calls go through
 * `/api/proxy/*`, which attaches the session token. Returns the bare `Service[]`;
 * a Spring page envelope is unwrapped, and an unexpected shape yields [].
 */
export async function getServices(): Promise<Service[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.SERVICES.CATEGORIES);
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

export function useServices() {
  return useQuery({
    queryKey: servicesQueryKey(),
    queryFn: getServices,
    staleTime: 1000 * 60 * 30,
  });
}
