import { ApiError } from '@/lib/api-client';
import { type Locale } from '@/types/locale';

/**
 * Localised, user-facing message for a failed portfolio request. An {@link ApiError}
 * yields its locale-matched message; any other error falls back to the caller's copy.
 */
export function localizedPortfolioError(err: unknown, locale: Locale, fallback: string): string {
  if (err instanceof ApiError) return err.localizedMessage(locale) ?? fallback;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

/**
 * True when `err` is the backend's "Portfolio already exists for this user" response.
 * The legacy and updated backends phrase the duplicate slightly differently and tuck
 * the message under either `error` or `message`; we match the substring case-insensitively
 * so both shapes register. Used by {@link createPortfolio} to throw the typed
 * {@link PortfolioAlreadyExistsError} so the UI can recover instead of deadlocking.
 */
export function isPortfolioAlreadyExists(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  if (err.status !== 400 && err.status !== 409) return false;
  const body = err.body as { error?: string; message?: string; messageEn?: string } | null;
  const text = `${body?.error ?? ''} ${body?.message ?? ''} ${body?.messageEn ?? ''}`.toLowerCase();
  return text.includes('already exists');
}

/**
 * Thrown by {@link createPortfolio} when POST /portfolios/create reports a duplicate.
 * The hook reacts to this by invalidating the portfolio query — the (now fixed)
 * normaliser re-resolves the existing row via `/me`, the screen flips to the manager
 * view, and the user is unstuck instead of staring at a "couldn't create" toast.
 * Carries the original error for callers that want to surface a localized message.
 */
export class PortfolioAlreadyExistsError extends Error {
  constructor(cause: unknown) {
    super('Portfolio already exists for this user', { cause });
    this.name = 'PortfolioAlreadyExistsError';
  }
}
