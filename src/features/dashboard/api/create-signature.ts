import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { type SignatureRequest, signatureRequestSchema } from '../schemas/signature';

/**
 * Create / resend the contract e-sign request. Mirrors the RN call site
 * website-bonyad/src/screens/projects/in-progress/modals/hooks/usePhaseApprovalData.ts:170
 * — POST /signatures with a **form-urlencoded** body, `phaseIds` joined as a CSV
 * and `language` upper-cased. The request is zod-validated first (CLAUDE rule 1).
 * The backend emails a copy of the contract to each party's registered address;
 * the customer's CONTRACT_SIGNING screen calls this for the "resend" action.
 */
export async function createSignature(input: SignatureRequest): Promise<void> {
  const body = signatureRequestSchema.parse(input);
  const form = new URLSearchParams({
    projectId: String(body.projectId),
    technicianId: String(body.technicianId),
    userEmail: body.userEmail,
    technicianEmail: body.technicianEmail,
    phaseIds: body.phaseIds.join(','),
    language: body.language,
  });
  await apiClient.post<unknown>(API_ENDPOINTS.SIGNATURES.CREATE, { body: form });
}

export function useCreateSignature() {
  return useMutation({ mutationFn: createSignature });
}
