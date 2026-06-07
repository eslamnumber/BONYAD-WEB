import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { PaginatedProjectsResponse, Project } from '../schemas/project';

/** Backend filter for the assigned list — biddable vs directly-assigned work. */
export type AssignedProjectType = 'BIDDING' | 'DIRECT_ASSIGNMENT';
export type GetAssignedProjectsParams = { type?: AssignedProjectType };

export const assignedProjectsQueryKey = (params: GetAssignedProjectsParams = {}) =>
  ['projects', 'assigned', params] as const;

/**
 * Projects the signed-in technician is working on (bidding + directly assigned).
 * Mirrors the RN call site website-bonyad/src/services/ProjectService.ts:471
 * (`getAssignedProjects`) — GET /projects/my-assigned with an optional `type`
 * query. Browser calls go through `/api/proxy/*`, which attaches the session
 * token. Returns the bare `Project[]` (the backend may also wrap it in a page
 * envelope — both shapes are handled).
 */
export async function getAssignedProjects(
  params: GetAssignedProjectsParams = {},
): Promise<Project[]> {
  const data = await apiClient.get<unknown>(API_ENDPOINTS.PROJECTS.MY_ASSIGNED, {
    params: { type: params.type },
  });
  return extractProjects(data);
}

function extractProjects(data: unknown): Project[] {
  if (Array.isArray(data)) return data as Project[];
  if (data && typeof data === 'object') {
    const content = (data as PaginatedProjectsResponse).content;
    if (Array.isArray(content)) return content;
  }
  return [];
}

export function useAssignedProjects(params: GetAssignedProjectsParams = {}) {
  return useQuery({
    queryKey: assignedProjectsQueryKey(params),
    queryFn: () => getAssignedProjects(params),
    staleTime: 1000 * 60 * 5,
  });
}
