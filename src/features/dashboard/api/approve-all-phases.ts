import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { contractQueryKey } from './get-contract';
import { projectQueryKey } from './get-project';
import { projectPhasesQueryKey } from './get-project-phases';

/**
 * Approve every phase of a project at once. Mirrors the RN service
 * website-bonyad/src/services/projectContractSigning.ts:43 — POST
 * /phases/project/:projectId/approve-all (empty JSON body). The backend saves the
 * phases and transitions the project APPROVED / PHASE_PLANNING → CONTRACT_SIGNING,
 * the only state that unlocks POST /signatures. Idempotent on the server. Returns
 * the project's new status (top-level `projectStatus` / `status`, enum string or
 * `{ name }`), falling back to 'CONTRACT_SIGNING'. Browser calls go through
 * `/api/proxy/*`, which attaches the session token.
 */
export async function approveAllPhases(projectId: number): Promise<string> {
  const path = API_ENDPOINTS.PHASES.APPROVE_ALL.replace(':projectId', String(projectId));
  const data = await apiClient.post<unknown>(path);
  return extractApprovedStatus(data) || 'CONTRACT_SIGNING';
}

/** Read the post-approval status from the response (top-level `projectStatus` / `status`). */
export function extractApprovedStatus(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  const o = data as Record<string, unknown>;
  const ps = o.projectStatus ?? o.status;
  if (ps === null || ps === undefined) return '';
  if (typeof ps === 'string') return ps.trim().toUpperCase();
  if (typeof ps === 'object' && 'name' in ps) {
    return String((ps as { name?: string }).name ?? '')
      .trim()
      .toUpperCase();
  }
  return String(ps).trim().toUpperCase();
}

/**
 * Approve all phases, then refresh the project (its status moves to CONTRACT_SIGNING,
 * re-routing the detail screen to the contract-sent view), its phases, and contract.
 */
export function useApproveAllPhases(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation<string, Error, void>({
    mutationFn: () => approveAllPhases(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectPhasesQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: contractQueryKey(projectId) });
    },
  });
}
