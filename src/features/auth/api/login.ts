import { useMutation } from '@tanstack/react-query';

import { API_ENDPOINTS } from '@/config/endpoints';
import { ApiError, apiClient } from '@/lib/api-client';

import {
  loginRequestSchema,
  type LoginFormValues,
  type LoginResponse,
  type LoginResult,
} from '../schemas/login.schema';
import { normalizePhoneForApi } from '../utils';

type LoginSubmit = LoginFormValues & { role: 'USER' | 'TECHNICIAN' };

const PENDING_VERIFICATION_CODE = 'USER_ALREADY_EXISTS_PENDING';

function isPendingMessage(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return m.includes('pending verification') || m.includes('otp sent');
}

function pickRole(raw: string | undefined, fallback: 'USER' | 'TECHNICIAN'): 'USER' | 'TECHNICIAN' {
  return raw === 'TECHNICIAN' ? 'TECHNICIAN' : raw === 'USER' ? 'USER' : fallback;
}

function toSuccess(
  token: string,
  data: LoginResponse,
  fallbackRole: 'USER' | 'TECHNICIAN',
): Extract<LoginResult, { kind: 'success' }> {
  return {
    kind: 'success',
    token,
    userId: data.user?.id ?? data.userId ?? 0,
    role: pickRole(data.user?.role ?? data.role, fallbackRole),
    requiresPasswordChange: data.requiresPasswordChange ?? data.user?.forcePasswordChange ?? false,
  };
}

function toResult(data: LoginResponse, values: LoginSubmit, phoneNumber: string): LoginResult {
  if (data.token) return toSuccess(data.token, data, values.role);
  if (isPendingMessage(data.message)) return { kind: 'pending', phoneNumber, role: values.role };
  throw new ApiError(200, data);
}

export async function loginUser(values: LoginSubmit): Promise<LoginResult> {
  const phoneNumber = normalizePhoneForApi(values.phone);
  const body = loginRequestSchema.parse({
    phoneNumber,
    password: values.password,
    role: values.role,
    fcmToken: 'no-token',
  });
  try {
    const data = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, { body });
    return toResult(data, values, phoneNumber);
  } catch (err) {
    if (err instanceof ApiError && err.errorCode === PENDING_VERIFICATION_CODE) {
      return { kind: 'pending', phoneNumber, role: values.role };
    }
    throw err;
  }
}

export function useLogin() {
  return useMutation<LoginResult, Error, LoginSubmit>({ mutationFn: loginUser });
}
