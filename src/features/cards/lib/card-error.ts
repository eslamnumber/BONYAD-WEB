import { ApiError } from '@/lib/api-client';
import { type Locale } from '@/types/locale';

/**
 * Localised, user-facing message for a failed card request. An {@link ApiError}
 * (non-2xx from the backend) yields its locale-matched `messageAr`/`messageEn`; a
 * plain `Error` (the `success: false` over-200 case, thrown with the backend reason)
 * yields its message; anything else falls back to the caller's copy.
 */
export function localizedCardError(err: unknown, locale: Locale, fallback: string): string {
  if (err instanceof ApiError) return err.localizedMessage(locale) ?? fallback;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
