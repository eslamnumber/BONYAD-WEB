import { z } from 'zod';

import { ApiError } from '@/lib/api-client';

import { saudiPhoneSchema } from '../utils';

type Role = 'USER' | 'TECHNICIAN';

export const loginFormSchema = z.object({
  phone: saudiPhoneSchema,
  password: z.string().min(1, { message: 'auth.errors.passwordRequired' }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const loginRequestSchema = z.object({
  phoneNumber: z.string(),
  password: z.string(),
  role: z.enum(['USER', 'TECHNICIAN']),
  fcmToken: z.string().default('no-token'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

/**
 * Raw response body from POST /auth/login. Intentionally loose — the backend is
 * shared with the RN app and may evolve (e.g. add user fields). The login flow
 * only needs `token`, `user.id`, `user.role`, and pending-verification `message`;
 * anything else is passed through as `unknown` and ignored. Do NOT tighten this
 * with `z.enum(['USER','TECHNICIAN'])` — production users can carry `role === 'ADMIN'`,
 * which would crash a strict enum and surface as a misleading "Something went wrong".
 */
export type LoginResponse = {
  token?: string;
  message?: string;
  user?: {
    id?: number;
    role?: string;
    deviceToken?: string;
    forcePasswordChange?: boolean;
  };
  userId?: number;
  role?: string;
  requiresPasswordChange?: boolean;
};

/**
 * Discriminated result the login route handler returns to the client. The JWT
 * is deliberately absent — it lives only in the httpOnly cookie the route
 * handler sets server-side, never in browser JS.
 */
export type LoginResult =
  | {
      kind: 'success';
      userId: number;
      role: Role;
      requiresPasswordChange: boolean;
    }
  | { kind: 'pending'; phoneNumber: string; role: Role };

/** Backend errorCode meaning "user exists but never verified their OTP". */
export const PENDING_VERIFICATION_CODE = 'USER_ALREADY_EXISTS_PENDING';

function isPendingMessage(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return m.includes('pending verification') || m.includes('otp sent');
}

function pickRole(raw: string | undefined, fallback: Role): Role {
  return raw === 'TECHNICIAN' ? 'TECHNICIAN' : raw === 'USER' ? 'USER' : fallback;
}

function toSuccessResult(
  data: LoginResponse,
  fallbackRole: Role,
): Extract<LoginResult, { kind: 'success' }> {
  return {
    kind: 'success',
    userId: data.user?.id ?? data.userId ?? 0,
    role: pickRole(data.user?.role ?? data.role, fallbackRole),
    requiresPasswordChange: data.requiresPasswordChange ?? data.user?.forcePasswordChange ?? false,
  };
}

/**
 * Map a raw `/auth/login` response into a {@link LoginResult}. A `token` means
 * success; a token-less body carrying a pending message means "verify OTP".
 * Anything else is an unexpected 200 shape and surfaces as an `ApiError`.
 * Runs server-side in the login route handler.
 */
export function toLoginResult(data: LoginResponse, role: Role, phoneNumber: string): LoginResult {
  if (data.token) return toSuccessResult(data, role);
  if (isPendingMessage(data.message)) return { kind: 'pending', phoneNumber, role };
  throw new ApiError(200, data);
}
