import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { Service } from '../schemas/service';

export const myServicesQueryKey = () => ['services', 'my'] as const;

/** Tolerate both response shapes the backend returns: `{ services }` or a bare array. */
export function extractServices(data: unknown): Service[] {
  if (Array.isArray(data)) return data as Service[];
  if (data && typeof data === 'object') {
    const services = (data as { services?: unknown }).services;
    if (Array.isArray(services)) return services as Service[];
  }
  return [];
}

/**
 * The signed-in technician's own offered services — GET
 * /technician/services/my-services. Mirrors the RN call site
 * website-bonyad/src/services/TechnicianServiceService.ts:64 (`getMyServices`):
 * the body is either `{ services: Service[] }` or a bare `Service[]`. The proxy
 * attaches the session token; an unexpected shape yields [].
 */
export async function getMyServices(): Promise<Service[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.SERVICES.MY_FOR_TECHNICIAN);
  return extractServices(data);
}

export function useMyServices() {
  return useQuery({
    queryKey: myServicesQueryKey(),
    queryFn: getMyServices,
    staleTime: 1000 * 30,
  });
}
