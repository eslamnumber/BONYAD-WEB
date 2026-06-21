import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { Service } from '../schemas/service';

export const myTechnicianServicesQueryKey = () => ['technician', 'services', 'my'] as const;

/**
 * The signed-in technician's own offered services — GET
 * /technician/services/my-services. Mirrors the RN call site
 * website-bonyad/src/services/TechnicianServiceService.ts:64 (`getMyServices`):
 * the body is either `{ services: Service[] }` or a bare `Service[]`. Backs the
 * Available-Projects service filter (a technician only sees offers matching a
 * service they provide). Browser calls go through `/api/proxy/*`, which attaches
 * the session token. An unexpected shape yields [].
 */
export async function getMyTechnicianServices(): Promise<Service[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.SERVICES.MY_FOR_TECHNICIAN);
  return extractServices(data);
}

function extractServices(data: unknown): Service[] {
  if (Array.isArray(data)) return data as Service[];
  if (data && typeof data === 'object') {
    const services = (data as { services?: unknown }).services;
    if (Array.isArray(services)) return services as Service[];
  }
  return [];
}

/**
 * Cached for 30 min — a technician's service set rarely changes within a session,
 * and the Available-Projects list filters against it on every render.
 */
export function useMyTechnicianServices() {
  return useQuery({
    queryKey: myTechnicianServicesQueryKey(),
    queryFn: getMyTechnicianServices,
    staleTime: 1000 * 60 * 30,
  });
}
