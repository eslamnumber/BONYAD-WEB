import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { type RequestPaymentResponse } from '../schemas/payment';

import { projectQueryKey } from './get-project';
import { projectPhasesQueryKey } from './get-project-phases';

/**
 * Technician requests payment for an approved phase — POST
 * /phases/:phaseId/request-payment with **no body** (mirrors RN
 * website-bonyad/src/services/PhaseService.ts:105). Flips the phase paymentStatus
 * PENDING → REQUESTED_PAYMENT so the customer is prompted to pay. Permissive
 * response (CLAUDE rule 1); the backend enforces the gating (technician-only, phase
 * approved, project IN_PROGRESS). Browser calls go through `/api/proxy/*`.
 */
export async function requestPhasePayment(phaseId: number): Promise<RequestPaymentResponse> {
  const path = API_ENDPOINTS.PHASES.REQUEST_PAYMENT.replace(':phaseId', String(phaseId));
  return apiClient.post<RequestPaymentResponse>(path);
}

/**
 * Request payment for a phase, then refresh the project + its phases so the phase
 * row re-renders in its REQUESTED_PAYMENT (awaiting) state.
 */
export function useRequestPhasePayment(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation<RequestPaymentResponse, Error, number>({
    mutationFn: (phaseId) => requestPhasePayment(phaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectPhasesQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKey(projectId) });
    },
  });
}
