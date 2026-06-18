import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  changePasswordRequestSchema,
  type ChangePasswordRequest,
} from '../schemas/change-password.schema';

/**
 * Change the signed-in user's password. Mirrors the iOS call site
 * MyProfile.swift:1480 — PUT /users/:userId/change-password with
 * `{ oldPassword, newPassword }`. The strict request schema validates the body
 * (hard rule 1). Browser calls go through `/api/proxy/*`, which attaches the
 * session token; a wrong old password surfaces as an `ApiError`.
 */
export async function changePassword(userId: number, input: ChangePasswordRequest): Promise<void> {
  const body = changePasswordRequestSchema.parse(input);
  await apiClient.put<unknown>(
    API_ENDPOINTS.USERS.CHANGE_PASSWORD.replace(':userId', String(userId)),
    { body },
  );
}

export function useChangePassword(userId: number) {
  return useMutation<void, Error, ChangePasswordRequest>({
    mutationFn: (input) => changePassword(userId, input),
  });
}
