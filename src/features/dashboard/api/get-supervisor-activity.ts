import { useQuery } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { SupervisorActivity } from '../schemas/supervisor';

export const supervisorActivityQueryKey = (projectId: number) =>
  ['supervision', 'activity', projectId] as const;

/**
 * The supervisor audit log for a project. Mirrors the iOS call site
 * bonayd-ios/.../App/Utils/SupervisorActionsService.swift (`fetchActivity`) — GET
 * /projects/:id/supervisor/activity → bare array. Verified live on the dev backend:
 * the endpoint 403s ("only the owner or active supervisor may read it") until the
 * supervisor is ACTIVE, so callers gate the query on the active state and the hook
 * does not retry. Browser calls go through `/api/proxy/*`, which attaches the token.
 */
export async function getSupervisorActivity(projectId: number): Promise<SupervisorActivity[]> {
  const path = API_ENDPOINTS.PROJECTS.SUPERVISOR_ACTIVITY.replace(':id', String(projectId));
  const data = await apiClient.get<unknown>(path);
  return Array.isArray(data) ? (data as SupervisorActivity[]) : [];
}

/**
 * @param enabled gate the fetch on the supervisor being ACTIVE — the endpoint 403s
 *   otherwise, so firing it before acceptance just produces a guaranteed error.
 */
export function useSupervisorActivity(projectId: number, enabled = true) {
  return useQuery({
    queryKey: supervisorActivityQueryKey(projectId),
    queryFn: () => getSupervisorActivity(projectId),
    staleTime: 1000 * 30,
    enabled,
    retry: false,
  });
}
