/**
 * Normalised current-user shape held by the auth store and consumed across the
 * authenticated app surface (sidebar profile, role gating, greetings).
 *
 * Sourced from `POST /auth/validate-token`, whose `user` object has the same
 * shape as `POST /auth/login`'s. Intentionally permissive — the backend is
 * shared with the RN app and may add fields. `role` stays a bare `string`
 * because production accounts can carry values beyond USER/TECHNICIAN (e.g.
 * ADMIN); a strict union would crash on an unseen value. Narrow at the consumer.
 */
export type AuthUser = {
  id: number;
  name?: string;
  role: string;
  phoneNumber?: string;
  email?: string;
  profileImage?: string;
  status?: string;
  onboarded?: boolean;
  profileComplete?: boolean;
};
