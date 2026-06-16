import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { Technician } from '../schemas/technician';

export type TechniciansQuery = {
  /** Free-text name/phone search from the picker search bar. */
  searchQuery?: string;
  /** Optional service filter (subcategory id). */
  serviceId?: number;
};

export const techniciansQueryKey = (params: TechniciansQuery = {}) =>
  ['technicians', params.serviceId ?? null, params.searchQuery ?? null] as const;

/**
 * Approved technicians for the direct-assignment picker. Mirrors the RN call site
 * website-bonyad/src/services/TechnicianService.ts:406 (`getTechnicians`) —
 * GET /users/technicians?serviceId=&searchQuery=. The backend returns an untyped
 * array; a page envelope is unwrapped and an unexpected shape yields []. Browser
 * calls go through `/api/proxy/*`, which attaches the session token.
 */
export async function getTechnicians(params: TechniciansQuery = {}): Promise<Technician[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.USERS.TECHNICIANS_LIST, {
    params: { serviceId: params.serviceId, searchQuery: params.searchQuery },
  });
  return extractTechnicians(data);
}

function extractTechnicians(data: unknown): Technician[] {
  if (Array.isArray(data)) return data as Technician[];
  if (data && typeof data === 'object') {
    const content = (data as { content?: unknown }).content;
    if (Array.isArray(content)) return content as Technician[];
  }
  return [];
}

/**
 * Picker hook. `enabled` is false while the modal is closed so the list is only
 * fetched when the direct-assignment picker opens.
 */
export function useTechnicians(params: TechniciansQuery = {}, enabled = true) {
  return useQuery({
    queryKey: techniciansQueryKey(params),
    queryFn: () => getTechnicians(params),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}
