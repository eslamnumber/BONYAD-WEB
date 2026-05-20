import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  registerRequestSchema,
  type RegisterFormValues,
  type RegisterResponse,
} from '../schemas/register.schema';
import { normalizePhoneForApi } from '../utils';

type RegisterSubmit = RegisterFormValues & { role: 'USER' | 'TECHNICIAN' };

export async function registerUser(values: RegisterSubmit): Promise<RegisterResponse> {
  const body = registerRequestSchema.parse({
    name: values.name,
    phoneNumber: normalizePhoneForApi(values.phone),
    password: values.password,
    role: values.role,
  });
  return apiClient.post<RegisterResponse>(API_ENDPOINTS.USERS.REGISTER, { body });
}

export function useRegister() {
  return useMutation<RegisterResponse, Error, RegisterSubmit>({ mutationFn: registerUser });
}
