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
