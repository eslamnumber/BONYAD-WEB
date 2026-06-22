import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { phaseWriteSchema, type PhasePlanSaveInput } from '../schemas/phase-plan';

import { projectQueryKey } from './get-project';
import { projectPhasesQueryKey } from './get-project-phases';

/**
 * Persist the technician's edited phase plan on an APPROVED / PHASE_PLANNING project.
 * Mirrors the iOS `PhasePlanningView` submit
 * (bonayd-ios/.../new_request/PhasePlanningView.swift): DELETE each removed phase,
 * then PUT every surviving phase (full body), then POST each new one — in that order.
 * Each write body is zod-validated up front (`phaseWriteSchema`, rule 1) and passed as
 * a plain body (the `schema` option parses the *response*, never the request). Browser
 * calls go through `/api/proxy/*`, which attaches the session token.
 */
export async function savePhasePlan(projectId: number, input: PhasePlanSaveInput): Promise<void> {
  for (const id of input.deletes) {
    await apiClient.delete(API_ENDPOINTS.PHASES.DELETE.replace(':phaseId', String(id)));
  }
  for (const phase of input.updates) {
    const body = phaseWriteSchema.parse({ projectId, ...stripId(phase) });
    await apiClient.put(API_ENDPOINTS.PHASES.UPDATE.replace(':phaseId', String(phase.id)), {
      body,
    });
  }
  for (const draft of input.creates) {
    const body = phaseWriteSchema.parse({ projectId, ...draft });
    await apiClient.post(API_ENDPOINTS.PHASES.CREATE, { body });
  }
}

/** Drop the local `id` so only the write fields go in the body. */
function stripId({ id: _id, ...draft }: PhasePlanSaveInput['updates'][number]) {
  return draft;
}

/**
 * Save the edited phase plan, then refresh the project's phases (the technician's
 * approved screen re-renders the list) and the project itself.
 */
export function useSavePhasePlan(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, PhasePlanSaveInput>({
    mutationFn: (input) => savePhasePlan(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectPhasesQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
    },
  });
}
