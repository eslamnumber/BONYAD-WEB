import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { type SignatureRequest, signatureRequestSchema } from '../schemas/signature';

/**
 * Create / resend the contract e-sign request. Mirrors the RN email path
 * website-bonyad/src/services/SignatureService.ts:143 (`createEmailSignatureRequest`
 * → `buildFormData`) — POST /signatures with a **form-urlencoded** body where each
 * phase id is a **repeated** `phaseIds` field (`phaseIds=1&phaseIds=2`), `language`
 * is upper-cased, and the backend auto-fetches both parties' emails from their
 * profiles. The request is zod-validated first (CLAUDE rule 1). The customer's
 * APPROVED + CONTRACT_SIGNING screens call this to send / resend the contract.
 */
export async function createSignature(input: SignatureRequest): Promise<void> {
  const body = signatureRequestSchema.parse(input);
  const form = new URLSearchParams();
  form.set('projectId', String(body.projectId));
  body.phaseIds.forEach((id) => form.append('phaseIds', String(id)));
  form.set('language', body.language);
  if (body.contractTerms) form.set('contractTerms', body.contractTerms);
  await apiClient.post<unknown>(API_ENDPOINTS.SIGNATURES.CREATE, { body: form });
}

export function useCreateSignature() {
  return useMutation({ mutationFn: createSignature });
}
