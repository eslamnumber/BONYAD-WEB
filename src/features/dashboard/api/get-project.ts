import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { ProjectDetail } from '../schemas/project';

export const projectQueryKey = (id: number) => ['projects', 'detail', id] as const;

/**
 * A single job offer / project detail. GET /projects/:id returns the full entity
 * WRAPPED in `{ project, phases, regionId, regionName* }`, with the client and
 * service as nested objects (`project.user.name`, `project.service.name{En,Ar}`)
 * — unlike the LIST endpoint, which is a flat DTO. {@link normalizeProjectDetail}
 * unwraps + flattens it into the same flat {@link ProjectDetail} the cards expect,
 * tolerating an already-flat body so tests/other shapes still work. Browser calls
 * go through `/api/proxy/*`, which attaches the session token.
 */
export async function getProject(id: number): Promise<ProjectDetail> {
  const path = API_ENDPOINTS.PROJECTS.DETAILS.replace(':id', String(id));
  const data = await apiClient.get<unknown>(path);
  return normalizeProjectDetail(data);
}

function normalizeProjectDetail(data: unknown): ProjectDetail {
  const root = (data ?? {}) as Record<string, unknown>;
  const raw = ((root.project as Record<string, unknown> | undefined) ?? root) as Record<
    string,
    unknown
  >;
  const user = raw.user as { name?: string } | undefined;
  const service = raw.service as { nameEn?: string; nameAr?: string } | undefined;
  return {
    ...(raw as ProjectDetail),
    userName: (raw.userName as string | undefined) ?? user?.name,
    serviceNameEn: (raw.serviceNameEn as string | undefined) ?? service?.nameEn,
    serviceNameAr: (raw.serviceNameAr as string | undefined) ?? service?.nameAr,
  };
}

export function useProject(id: number) {
  return useQuery({
    queryKey: projectQueryKey(id),
    queryFn: () => getProject(id),
    staleTime: 1000 * 60 * 5,
  });
}
