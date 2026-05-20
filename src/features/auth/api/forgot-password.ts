import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  forgotPasswordRequestSchema,
  type ForgotPasswordFormValues,
  type ForgotPasswordResponse,
} from '../schemas/forgot-password.schema';
import { normalizePhoneForApi } from '../utils';

type ForgotPasswordSubmit = ForgotPasswordFormValues & { role: 'USER' | 'TECHNICIAN' };

export async function forgotPassword(
  values: ForgotPasswordSubmit,
): Promise<ForgotPasswordResponse> {
  const body = forgotPasswordRequestSchema.parse({
    phoneNumber: normalizePhoneForApi(values.phone),
    role: values.role,
  });
  return apiClient.post<ForgotPasswordResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { body });
}

export function useForgotPassword() {
  return useMutation<ForgotPasswordResponse, Error, ForgotPasswordSubmit>({
    mutationFn: forgotPassword,
  });
}
