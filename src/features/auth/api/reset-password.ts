import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  resetPasswordRequestSchema,
  type ResetPasswordFormValues,
  type ResetPasswordResponse,
} from '../schemas/reset-password.schema';

type Role = 'USER' | 'TECHNICIAN';
type ResetPasswordSubmit = ResetPasswordFormValues & { phoneNumber: string; role: Role };
type ResendSubmit = { phoneNumber: string; role: Role };

/** Verify the OTP and set the new password in one call (POST /auth/reset-password). */
export async function resetPassword(values: ResetPasswordSubmit): Promise<ResetPasswordResponse> {
  const body = resetPasswordRequestSchema.parse({
    phoneNumber: values.phoneNumber,
    role: values.role,
    otpCode: values.otp,
    newPassword: values.newPassword,
    confirmPassword: values.confirmPassword,
  });
  return apiClient.post<ResetPasswordResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, { body });
}

export function useResetPassword() {
  return useMutation<ResetPasswordResponse, Error, ResetPasswordSubmit>({
    mutationFn: resetPassword,
  });
}

/** Re-send the forgot-password OTP (POST /auth/forgot-password/resend). */
export async function resendForgotPasswordOtp(values: ResendSubmit): Promise<void> {
  await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_RESEND, { body: values });
}

export function useResendForgotPasswordOtp() {
  return useMutation<void, Error, ResendSubmit>({ mutationFn: resendForgotPasswordOtp });
}
