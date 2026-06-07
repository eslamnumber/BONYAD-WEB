import { API_ENVIRONMENTS, apiEnvironmentFromKey } from '@/config/api-environments';
import { env } from '@/config/env';

/**
 * Absolute base URL of the shared REST backend (Cloud Run). Default target when
 * no per-request environment override is supplied. The browser never talks to
 * this directly — CSP `connect-src 'self'` forbids it — it goes through
 * `/api/proxy/*`, which forwards here server-side. See `docs/api-and-auth.md`
 * §Token storage and `docs/api-environment-switcher.md`.
 *
 * `NEXT_PUBLIC_API_BASE_URL` (when set) overrides the default production host;
 * otherwise the production entry in the environment registry is used.
 */
export const BACKEND_BASE_URL =
  (env as { NEXT_PUBLIC_API_BASE_URL?: string }).NEXT_PUBLIC_API_BASE_URL ??
  API_ENVIRONMENTS.production.apiBaseUrl;

/** Same-origin path prefix the browser uses to reach the backend via the proxy. */
export const PROXY_PREFIX = '/api/proxy';

/**
 * Resolve the backend API base URL for a persisted environment key (from the
 * `bonyad-api-env` cookie). This is the web equivalent of the Android
 * EnvironmentInterceptor: it decides which host a server-side call targets.
 * Unknown keys resolve to production.
 */
export function resolveBackendBaseUrl(envKey: string | undefined | null): string {
  return apiEnvironmentFromKey(envKey).apiBaseUrl;
}

/**
 * Build an absolute URL for a backend asset (project images, avatars). Mirrors
 * `buildAssetUrl` in website-bonyad/src/config/api.ts: full URLs pass through;
 * relative paths attach to the backend host WITHOUT the `/api` suffix (assets are
 * served from the host root, not the API). The host is allow-listed in
 * `next.config.ts` images.remotePatterns so `next/image` can optimize it.
 */
export function buildAssetUrl(relativePath: string | undefined | null): string {
  if (!relativePath) return '';
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  const host = BACKEND_BASE_URL.replace(/\/api\/?$/, '');
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${host}${path}`;
}
