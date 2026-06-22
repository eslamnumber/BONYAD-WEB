import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { respondSupervisorSchema, type ProjectSupervisor } from '../schemas/supervisor';

/**
 * The invited technician accepts or declines a supervision invitation. Mirrors the
 * iOS call site bonayd-ios/.../App/Utils/SupervisorAPIService.swift (`respond`) —
 * POST /projects/:id/supervisor/respond with a strict `{ accept }` body (hard rule 1).
 * Verified live on the dev backend: returns the updated {@link ProjectSupervisor}
 * with `status` flipped to ACTIVE (accept) or DECLINED. Browser calls go through
 * `/api/proxy/*`, which attaches the session token.
 */
export async function respondSupervisorInvite(
  projectId: number,
  accept: boolean,
): Promise<ProjectSupervisor> {
  const body = respondSupervisorSchema.parse({ accept });
  const path = API_ENDPOINTS.PROJECTS.SUPERVISOR_RESPOND.replace(':id', String(projectId));
  return apiClient.post<ProjectSupervisor>(path, { body });
}

export type RespondSupervisorVars = { projectId: number; accept: boolean };

/**
 * Respond to an invitation, then drop every supervision query — the project moves
 * between the Invitations and Active buckets and its supervisor state changes.
 */
export function useRespondSupervisorInvite() {
  const queryClient = useQueryClient();
  return useMutation<ProjectSupervisor, Error, RespondSupervisorVars>({
    mutationFn: ({ projectId, accept }) => respondSupervisorInvite(projectId, accept),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['supervision'] }),
  });
}
