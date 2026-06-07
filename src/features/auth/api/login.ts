import { useMutation } from '@tanstack/react-query';

import { INTERNAL_API } from '@/config/routes';
import { apiClient } from '@/lib/api-client';

import { type LoginFormValues, type LoginResult } from '../schemas/login.schema';
import { normalizePhoneForApi } from '../utils';

type LoginSubmit = LoginFormValues & { role: 'USER' | 'TECHNICIAN' };

/**
 * Submit credentials to the same-origin login route handler, which calls the
 * backend, sets the httpOnly session cookie, and returns a token-less
 * {@link LoginResult}. On failure the route forwards the backend status +
 * localised error envelope, surfacing here as an `ApiError`.
 */
export async function loginUser(values: LoginSubmit): Promise<LoginResult> {
  const phoneNumber = normalizePhoneForApi(values.phone);
  return apiClient.post<LoginResult>(INTERNAL_API.AUTH_LOGIN, {
    internal: true,
    body: {
      phoneNumber,
      password: values.password,
      role: values.role,
      fcmToken: 'no-token',
    },
  });
}

export function useLogin() {
  return useMutation<LoginResult, Error, LoginSubmit>({ mutationFn: loginUser });
}
