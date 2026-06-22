import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { HireableTechnician } from '../schemas/supervisor';

export const hireableTechniciansQueryKey = () => ['supervision', 'hireable'] as const;

/**
 * Technicians the customer can hire as a project supervisor. Mirrors the iOS call
 * site bonayd-ios/.../App/Utils/SupervisorAPIService.swift (`fetchHireable`) — GET
 * /projects/hireable-technicians. Verified live on the dev backend: a bare array of
 * `{ id, name, phoneNumber, profileImage, companyName }`; a `{ technicians }` /
 * `{ content }` envelope is tolerated. Browser calls go through `/api/proxy/*`.
 */
export async function getHireableTechnicians(): Promise<HireableTechnician[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.PROJECTS.HIREABLE_TECHNICIANS);
  return extractList(data);
}

function extractList(data: unknown): HireableTechnician[] {
  if (Array.isArray(data)) return data as HireableTechnician[];
  if (data && typeof data === 'object') {
    const obj = data as { technicians?: HireableTechnician[]; content?: HireableTechnician[] };
    if (Array.isArray(obj.technicians)) return obj.technicians;
    if (Array.isArray(obj.content)) return obj.content;
  }
  return [];
}

/** @param enabled gate the fetch on the hire modal being open (don't prefetch the list). */
export function useHireableTechnicians(enabled = true) {
  return useQuery({
    queryKey: hireableTechniciansQueryKey(),
    queryFn: getHireableTechnicians,
    staleTime: 1000 * 60,
    enabled,
  });
}
