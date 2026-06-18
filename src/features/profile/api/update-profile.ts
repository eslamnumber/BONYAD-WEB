import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  profileUpdateRequestSchema,
  type ProfileUpdateRequest,
} from '../schemas/edit-profile.schema';

import { myProfileQueryKey } from './get-my-profile';

/**
 * Update the signed-in user's own profile. Mirrors the iOS call site
 * MyProfile.swift:699 — PUT /users/profile (token-based, no id) with a JSON body
 * of only the changed fields. The strict {@link profileUpdateRequestSchema}
 * validates it (hard rule 1). Browser calls go through `/api/proxy/*`.
 */
export async function updateProfile(input: ProfileUpdateRequest): Promise<void> {
  const body = profileUpdateRequestSchema.parse(input);
  await apiClient.put<unknown>(API_ENDPOINTS.USERS.PROFILE, { body });
}

/** Save the profile, then refresh the live profile so the summary re-reads it. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, ProfileUpdateRequest>({
    mutationFn: updateProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myProfileQueryKey() }),
  });
}
