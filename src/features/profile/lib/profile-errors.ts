import { ApiError } from '@/lib/api-client';

/**
 * The backend rejects a profile update whose email is taken with a *raw* Postgres
 * error — the `users_email_key` unique-constraint violation — instead of a typed
 * `errorCode`. Detect it by the constraint name (or a generic duplicate-key + email
 * pair) anywhere in the error body so the Edit-profile form can show a clean
 * "email already in use" field message rather than the generic "something went wrong".
 */
export function isEmailTakenError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  const haystack = JSON.stringify(err.body ?? '').toLowerCase();
  return (
    haystack.includes('users_email_key') ||
    (haystack.includes('duplicate key') && haystack.includes('email'))
  );
}
