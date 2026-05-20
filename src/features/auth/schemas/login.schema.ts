import { z } from 'zod';

export const loginFormSchema = z.object({
  phone: z
    .string()
    .min(1, { message: 'auth.errors.phoneRequired' })
    .regex(/^\d{9,15}$/, { message: 'auth.errors.phoneInvalid' }),
  password: z
    .string()
    .min(1, { message: 'auth.errors.passwordRequired' })
    .min(6, { message: 'auth.errors.passwordTooShort' }),
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

/** Discriminated result returned by `loginUser`. */
export type LoginResult =
  | {
      kind: 'success';
      token: string;
      userId: number;
      role: 'USER' | 'TECHNICIAN';
      requiresPasswordChange: boolean;
    }
  | { kind: 'pending'; phoneNumber: string; role: 'USER' | 'TECHNICIAN' };
