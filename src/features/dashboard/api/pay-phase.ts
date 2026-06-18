import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  type PayPhaseRequest,
  type PayPhaseResponse,
  payPhaseRequestSchema,
} from '../schemas/payment';

import { projectQueryKey } from './get-project';
import { projectPhasesQueryKey } from './get-project-phases';

/**
 * Mark a phase paid (PAID / PARTIALLY_PAID) after a successful charge. Mirrors the
 * RN call site website-bonyad/src/services/PhaseService.ts:138 — POST
 * /phases/:phaseId/pay with an optional JSON body (paymentType / amount /
 * paymentMethod / paymentReference / gatewayTransactionId). The request is
 * zod-validated when present (CLAUDE rule 1); the response is permissive.
 */
export async function payPhase(
  phaseId: number,
  params?: PayPhaseRequest,
): Promise<PayPhaseResponse> {
  const path = API_ENDPOINTS.PHASES.PAY.replace(':phaseId', String(phaseId));
  const body = params ? payPhaseRequestSchema.parse(params) : undefined;
  return apiClient.post<PayPhaseResponse>(path, body ? { body } : undefined);
}

type PayPhaseVars = { phaseId: number; params?: PayPhaseRequest };

/**
 * Pay a phase, then refresh the project + its phases so the payment-status /
 * budget cards and the progress bar re-derive from the new paymentStatus.
 */
export function usePayPhase(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation<PayPhaseResponse, Error, PayPhaseVars>({
    mutationFn: ({ phaseId, params }) => payPhase(phaseId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectPhasesQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
    },
  });
}
