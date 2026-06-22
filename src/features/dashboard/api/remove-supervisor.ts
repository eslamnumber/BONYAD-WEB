import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { ProjectSupervisor } from '../schemas/supervisor';

/**
 * The project owner cancels a pending invitation or removes the active supervisor.
 * Mirrors the iOS call site bonayd-ios/.../App/Utils/SupervisorAPIService.swift
 * (`remove`) — DELETE /projects/:id/supervisor (no body). Verified live on the dev
 * backend (project 223): returns the {@link ProjectSupervisor} with `status:
 * 'REMOVED'` and a nulled supervisor. Browser calls go through `/api/proxy/*`.
 */
export async function removeSupervisor(projectId: number): Promise<ProjectSupervisor> {
  const path = API_ENDPOINTS.PROJECTS.SUPERVISOR.replace(':id', String(projectId));
  return apiClient.delete<ProjectSupervisor>(path);
}

/**
 * Cancel/remove the supervisor, then refresh the customer's project lists (the
 * row's `supervisorStatus` clears) + any supervision queries.
 */
export function useRemoveSupervisor() {
  const queryClient = useQueryClient();
  return useMutation<ProjectSupervisor, Error, number>({
    mutationFn: removeSupervisor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['supervision'] });
    },
  });
}
