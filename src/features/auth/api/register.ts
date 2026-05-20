import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { apiClient } from '@/lib/api-client';

import {
  registerRequestSchema,
  registerResponseSchema,
  type RegisterFormValues,
  type RegisterResponse,
} from '../schemas/register.schema';

type RegisterSubmit = RegisterFormValues & { role: 'USER' | 'TECHNICIAN' };

export async function registerUser(values: RegisterSubmit): Promise<RegisterResponse> {
  const normalizedPhone = values.phone.replace(/\D/g, '').replace(/^0+/, '').slice(0, 9);
  const body = registerRequestSchema.parse({
    name: values.name,
    phoneNumber: normalizedPhone,
    password: values.password,
    role: values.role,
  });
  return apiClient.post(API_ENDPOINTS.USERS.REGISTER, { body, schema: registerResponseSchema });
}

export function useRegister() {
  return useMutation<RegisterResponse, Error, RegisterSubmit>({ mutationFn: registerUser });
}
