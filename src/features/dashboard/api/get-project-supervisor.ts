import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { ProjectSupervisor } from '../schemas/supervisor';

export const projectSupervisorQueryKey = (projectId: number) =>
  ['supervision', 'state', projectId] as const;

/**
 * The supervisor assignment for one project. Mirrors the iOS call site
 * bonayd-ios/.../App/Utils/SupervisorAPIService.swift (`fetchSupervisor`) — GET
 * /projects/:id/supervisor. Verified live on the dev backend (project 213): returns
 * the {@link ProjectSupervisor} envelope (status / phone / timestamps / `active`).
 * Browser calls go through `/api/proxy/*`, which attaches the session token.
 */
export async function getProjectSupervisor(projectId: number): Promise<ProjectSupervisor> {
  const path = API_ENDPOINTS.PROJECTS.SUPERVISOR.replace(':id', String(projectId));
  return apiClient.get<ProjectSupervisor>(path);
}

export function useProjectSupervisor(projectId: number) {
  return useQuery({
    queryKey: projectSupervisorQueryKey(projectId),
    queryFn: () => getProjectSupervisor(projectId),
    staleTime: 1000 * 60,
  });
}
