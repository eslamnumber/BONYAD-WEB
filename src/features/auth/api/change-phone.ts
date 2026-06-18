import { API_ENDPOINTS } from '@/config/endpoints';
import { INTERNAL_API } from '@/config/routes';
import { apiClient } from '@/lib/api-client';
import { normalizePhoneForApi } from '@/lib/saudi-phone';

import {
  changePhoneRequestSchema,
  verifyPhoneRequestSchema,
  type VerifyPhoneResult,
} from '../schemas/change-phone.schema';

/**
 * Request an OTP to change the phone. Mirrors the iOS call site
 * MyProfile.swift:1086 — POST /users/:userId/change-phone-request with the 9-digit
 * national body. Browser calls go through `/api/proxy/*` (current token attached).
 */
export async function requestPhoneChange(userId: number, phone: string): Promise<void> {
  const body = changePhoneRequestSchema.parse({ newPhoneNumber: normalizePhoneForApi(phone) });
  await apiClient.post<unknown>(
    API_ENDPOINTS.USERS.CHANGE_PHONE_REQUEST.replace(':userId', String(userId)),
    { body },
  );
}

/**
 * Verify the OTP via the same-origin internal route, which calls the backend
 * server-side and re-mints the session cookie with the rotated JWT (see
 * `/api/auth/change-phone-verify`). Returns the updated user.
 */
export async function verifyPhoneChange(
  userId: number,
  otpCode: string,
): Promise<VerifyPhoneResult> {
  const body = verifyPhoneRequestSchema.parse({ userId, otpCode });
  return apiClient.post<VerifyPhoneResult>(INTERNAL_API.AUTH_CHANGE_PHONE_VERIFY, {
    body,
    internal: true,
  });
}
