import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  resendOtpRequestSchema,
  verifyOtpRequestSchema,
  verifyOtpResponseSchema,
  type VerifyOtpFormValues,
  type VerifyOtpResponse,
} from '../schemas/verify-otp.schema';

type VerifyOtpSubmit = VerifyOtpFormValues & { phoneNumber: string; role: 'USER' | 'TECHNICIAN' };
type ResendOtpSubmit = { phoneNumber: string; role: 'USER' | 'TECHNICIAN' };

export async function verifyOtp(values: VerifyOtpSubmit): Promise<VerifyOtpResponse> {
  const body = verifyOtpRequestSchema.parse({
    phoneNumber: values.phoneNumber,
    otpCode: values.otp,
    role: values.role,
  });
  return apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { body, schema: verifyOtpResponseSchema });
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
