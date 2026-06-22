import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { SupervisingProject } from '../schemas/supervisor';

/** The two supervising buckets the SP screen tabs between. */
export type SupervisingFilter = 'invited' | 'active';

export const supervisingProjectsQueryKey = (status: SupervisingFilter) =>
  ['supervision', 'list', status] as const;

/**
 * Projects this technician supervises, filtered by invitation state. Mirrors the iOS
 * call site bonayd-ios/.../App/Utils/SupervisorAPIService.swift (`fetchSupervising`)
 * — GET /projects/supervising?status=invited|active. Verified live on the dev backend
 * (project 213): a bare array of full project DTOs; a `{ content }` envelope is
 * tolerated for backend flexibility. Browser calls go through `/api/proxy/*`, which
 * attaches the session token.
 */
export async function getSupervisingProjects(
  status: SupervisingFilter,
): Promise<SupervisingProject[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.PROJECTS.SUPERVISING, {
    params: { status },
  });
  return extractList(data);
}

function extractList(data: unknown): SupervisingProject[] {
  if (Array.isArray(data)) return data as SupervisingProject[];
  if (data && typeof data === 'object') {
    const content = (data as { content?: SupervisingProject[] }).content;
    if (Array.isArray(content)) return content;
  }
  return [];
}

export function useSupervisingProjects(status: SupervisingFilter) {
  return useQuery({
    queryKey: supervisingProjectsQueryKey(status),
    queryFn: () => getSupervisingProjects(status),
    staleTime: 1000 * 30,
  });
}
