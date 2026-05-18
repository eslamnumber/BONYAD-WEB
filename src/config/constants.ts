import type { Locale } from '@/types/locale';

/**
 * App-wide constants. Anything that's a "magic number" used in ≥2 places lives here.
 * Single-feature constants live next to the feature.
 */

// ---------------------------------------------------------------------------
// Locale
// ---------------------------------------------------------------------------

export const DEFAULT_LOCALE: Locale = 'en';

/** Cookie name used to persist the user's locale choice across server + client. */
export const LOCALE_COOKIE_NAME = 'bonyad-lang';

/** Cookie name used by next-themes for light/dark/system preference. */
export const THEME_COOKIE_NAME = 'bonyad-theme';

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------

/** Default debounce for search inputs (ms). */
export const SEARCH_DEBOUNCE_MS = 300;

/** Default toast auto-dismiss time (ms). */
export const TOAST_DURATION_MS = 4000;

// ---------------------------------------------------------------------------
// ISR / caching
// ---------------------------------------------------------------------------

/** Default `revalidate` for public listing pages (1 hour). */
export const ISR_DEFAULT_SECONDS = 3600;

/** Pre-render this many top-N dynamic routes at build time. */
export const ISR_TOP_N_STATIC = 100;
