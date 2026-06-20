import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import { myProfileQueryKey } from './get-my-profile';

/** POST /users/update-profile-image response — the new avatar path (permissive). */
type ProfileImageResponse = { profileImage?: string };

/**
 * Upload the signed-in user's avatar. Mirrors the iOS call site
 * MyProfile.swift:782 — POST (multipart/form-data, field `profileImage`)
 * /users/update-profile-image → `{ profileImage }`. `apiClient` passes the
 * `FormData` through untouched so fetch writes the multipart boundary, and the
 * proxy re-streams it with the Bearer attached. Returns the new path; the avatar
 * itself refreshes off the invalidated profile query (the canonical display source).
 */
export async function uploadProfileImage(file: File): Promise<string | undefined> {
  const form = new FormData();
  form.append('profileImage', file);
  const data = await apiClient.post<ProfileImageResponse>(API_ENDPOINTS.USERS.PROFILE_IMAGE, {
    body: form,
  });
  return data.profileImage;
}

/** Upload the avatar, then refresh the profile so every avatar re-reads the new image. */
export function useUploadProfileImage() {
  const queryClient = useQueryClient();
  return useMutation<string | undefined, Error, File>({
    mutationFn: uploadProfileImage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myProfileQueryKey() }),
  });
}
