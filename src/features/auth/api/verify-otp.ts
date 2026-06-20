import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { INTERNAL_API } from '@/config/routes';
import { apiClient } from '@/lib/api-client';

import {
  resendOtpRequestSchema,
  verifyOtpRequestSchema,
  verifyOtpResponseSchema,
  type VerifyOtpFormValues,
  type VerifyOtpResponse,
} from '../schemas/verify-otp.schema';

type VerifyOtpSubmit = VerifyOtpFormValues & {
  phoneNumber: string;
  role: 'USER' | 'TECHNICIAN';
  /** Terms version agreed on the signup screen; recorded server-side after verification. */
  termsId?: number;
};
type ResendOtpSubmit = { phoneNumber: string; role: 'USER' | 'TECHNICIAN' };

/**
 * Verify a registration OTP via the same-origin internal route, which calls the
 * backend server-side and (best-effort) records the Terms agreement with the issued
 * token before discarding it (see `/api/auth/verify-otp`). The response is the
 * route's token-less `{ message? }`, so it's typed, not strict-parsed.
 */
export async function verifyOtp(values: VerifyOtpSubmit): Promise<VerifyOtpResponse> {
  const body = verifyOtpRequestSchema.parse({
    phoneNumber: values.phoneNumber,
    otpCode: values.otp,
    role: values.role,
    termsId: values.termsId,
  });
  return apiClient.post<VerifyOtpResponse>(INTERNAL_API.AUTH_VERIFY_OTP, { body, internal: true });
}

export function useVerifyOtp() {
  return useMutation<VerifyOtpResponse, Error, VerifyOtpSubmit>({ mutationFn: verifyOtp });
}

export async function resendOtp(values: ResendOtpSubmit): Promise<void> {
  const body = resendOtpRequestSchema.parse(values);
  await apiClient.post(API_ENDPOINTS.AUTH.RESEND_OTP, { body, schema: verifyOtpResponseSchema });
}

export function useResendOtp() {
  return useMutation<void, Error, ResendOtpSubmit>({ mutationFn: resendOtp });
}
