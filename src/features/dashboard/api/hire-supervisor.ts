import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { hireSupervisorSchema, type ProjectSupervisor } from '../schemas/supervisor';

/**
 * The project owner hires/invites a technician as the project's supervisor. Mirrors
 * the iOS call site bonayd-ios/.../App/Utils/SupervisorAPIService.swift (`hire`) —
 * POST /projects/:id/supervisor with a strict `{ technicianId }` body (hard rule 1).
 * Verified live on the dev backend (project 223): returns the new
 * {@link ProjectSupervisor} with `status: 'INVITED'`. Browser calls go through
 * `/api/proxy/*`, which attaches the session token.
 */
export async function hireSupervisor(
  projectId: number,
  technicianId: number,
): Promise<ProjectSupervisor> {
  const body = hireSupervisorSchema.parse({ technicianId });
  const path = API_ENDPOINTS.PROJECTS.SUPERVISOR.replace(':id', String(projectId));
  return apiClient.post<ProjectSupervisor>(path, { body });
}

export type HireSupervisorVars = { projectId: number; technicianId: number };

/**
 * Hire a supervisor, then refresh the customer's project lists (the row's
 * `supervisorStatus` flips to INVITED) + any supervision queries.
 */
export function useHireSupervisor() {
  const queryClient = useQueryClient();
  return useMutation<ProjectSupervisor, Error, HireSupervisorVars>({
    mutationFn: ({ projectId, technicianId }) => hireSupervisor(projectId, technicianId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['supervision'] });
    },
  });
}
