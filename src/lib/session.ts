import { z } from 'zod';

import type { AuthUser } from '@/types/auth';

/**
 * Session contract for `POST /auth/validate-token` — shared infrastructure used
 * by the server-side session reader and tests. Mirrors the RN call site
 * `website-bonyad/src/utils/authGuard.ts`.
 */

/** Strict request body — `{ token }`. */
export const validateTokenRequestSchema = z.object({
  token: z.string(),
});

export type ValidateTokenRequest = z.infer<typeof validateTokenRequestSchema>;

/**
 * Raw response — same structure as login: `{ message, token, user }`. Permissive
 * on purpose (see `docs/api-and-auth.md` §Schema strategy); `user.role` is a
 * bare string because production can return roles beyond USER/TECHNICIAN.
 */
export type ValidateTokenResponse = {
  message?: string;
  token?: string;
  user?: {
    id?: number;
    name?: string;
    role?: string;
    phoneNumber?: string;
    email?: string;
    profileImage?: string;
    status?: string;
    onboarded?: boolean;
    profileComplete?: boolean;
  };
};

/**
 * Normalise a raw validate-token / login `user` payload into the shared
 * {@link AuthUser}. Returns `null` when there is no usable numeric `id` —
 * callers treat that as "not authenticated".
 */
export function toAuthUser(raw: ValidateTokenResponse['user'] | undefined): AuthUser | null {
  if (!raw || typeof raw.id !== 'number') return null;
  return {
    id: raw.id,
    name: raw.name,
    role: raw.role ?? '',
    phoneNumber: raw.phoneNumber,
    email: raw.email,
    profileImage: raw.profileImage,
    status: raw.status,
    onboarded: raw.onboarded,
    profileComplete: raw.profileComplete,
  };
}
