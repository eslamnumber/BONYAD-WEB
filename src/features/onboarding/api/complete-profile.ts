import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import type { CompleteProfileValues } from '../schemas/complete-profile.schema';

/** POST /users/complete-profile response — permissive (rule 1). */
export type CompleteProfileResponse = { profileComplete?: boolean };

/** Backend `errorCode` (or message) meaning the submitted email is already taken. */
export const EMAIL_ALREADY_EXISTS_CODE = 'EMAIL_ALREADY_EXISTS';

export type CompleteProfileInput = { values: CompleteProfileValues; certificates: File[] };

/**
 * Build the multipart body the backend expects. Mirrors the iOS submit body
 * (CompleteTechnicianProfileView.swift:804): `email` · `description` (the form's
 * `bio`) · `address` · `yearsOfExperience` · one repeated `regionIds` field per
 * region · one repeated `certificates` field per file. `apiClient` forwards the
 * `FormData` untouched so fetch writes the multipart boundary itself.
 */
function toFormData({ values, certificates }: CompleteProfileInput): FormData {
  const form = new FormData();
  form.append('email', values.email.trim());
  form.append('description', values.bio.trim());
  form.append('address', values.address.trim());
  form.append('yearsOfExperience', values.yearsOfExperience);
  values.regionIds.forEach((id) => form.append('regionIds', String(id)));
  certificates.forEach((file) => form.append('certificates', file));
  return form;
}

/**
 * Submit technician onboarding step 2. Mirrors the iOS call site
 * CompleteTechnicianProfileView.swift:781 / RN `USER.COMPLETE_PROFILE`. A 409 /
 * `errorCode: EMAIL_ALREADY_EXISTS` surfaces as an {@link ApiError}; the form maps
 * it to the email field.
 */
export async function completeProfile(
  input: CompleteProfileInput,
): Promise<CompleteProfileResponse> {
  return apiClient.post<CompleteProfileResponse>(API_ENDPOINTS.USERS.COMPLETE_PROFILE, {
    body: toFormData(input),
  });
}

/** Mutation hook for the Complete-your-profile form. Errors propagate as {@link ApiError}. */
export function useCompleteProfile() {
  return useMutation<CompleteProfileResponse, Error, CompleteProfileInput>({
    mutationFn: completeProfile,
  });
}
