import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  forgotPasswordRequestSchema,
  forgotPasswordResponseSchema,
  type ForgotPasswordFormValues,
  type ForgotPasswordResponse,
} from '../schemas/forgot-password.schema';

type ForgotPasswordSubmit = ForgotPasswordFormValues & { role: 'USER' | 'TECHNICIAN' };

export async function forgotPassword(
  values: ForgotPasswordSubmit,
): Promise<ForgotPasswordResponse> {
  const normalizedPhone = values.phone.replace(/\D/g, '').replace(/^0+/, '');
  const body = forgotPasswordRequestSchema.parse({
    phoneNumber: normalizedPhone,
    role: values.role,
  });
  return apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
    body,
    schema: forgotPasswordResponseSchema,
  });
}

export function useForgotPassword() {
  return useMutation<ForgotPasswordResponse, Error, ForgotPasswordSubmit>({
    mutationFn: forgotPassword,
  });
}
