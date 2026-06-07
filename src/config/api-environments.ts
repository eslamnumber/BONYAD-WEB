/**
 * Runtime-switchable backend registry. Mirrors the Kotlin Android app's
 * `ApiEnvironment` enum so a single deployed build can be flipped between the
 * production and development backends at runtime (behind a hidden gesture).
 *
 * URLs are hardcoded on purpose: this file must NOT read `process.env`
 * (`no-restricted-globals: process` is enforced — env access lives only in
 * `src/config/env.ts`). The selected key is persisted in a cookie and resolved
 * server-side by the proxy / RSC layer.
 *
 * Default is always production; an unknown/corrupt key resolves to production
 * so a bad cookie can never strand a user on dev.
 */

export type ApiEnvironmentKey = 'production' | 'dev';

export type ApiEnvironment = {
  key: ApiEnvironmentKey;
  baseUrl: string;
  /** Including the shared `/api` suffix — this is what apiClient/proxy target. */
  apiBaseUrl: string;
  /** i18n key, resolved in the UI layer (this module stays Compose/React-free). */
  displayNameKey: string;
  /** Hex used by the badge pill. */
  badgeColor: string;
};

export const API_ENVIRONMENTS: Record<ApiEnvironmentKey, ApiEnvironment> = {
  production: {
    key: 'production',
    baseUrl: 'https://bonyad-app-1026710889441.me-central1.run.app',
    apiBaseUrl: 'https://bonyad-app-1026710889441.me-central1.run.app/api',
    displayNameKey: 'env.production',
    badgeColor: '#2980E8',
  },
  dev: {
    key: 'dev',
    baseUrl: 'https://bonyad-app-dev-1026710889441.me-central1.run.app',
    apiBaseUrl: 'https://bonyad-app-dev-1026710889441.me-central1.run.app/api',
    displayNameKey: 'env.development',
    badgeColor: '#F29E12',
  },
};

export const DEFAULT_API_ENVIRONMENT: ApiEnvironmentKey = 'production';

/** Corrupt/unknown value → production. Mirrors `ApiEnvironment.fromKey`. */
export function apiEnvironmentFromKey(key: string | undefined | null): ApiEnvironment {
  return key && key in API_ENVIRONMENTS
    ? API_ENVIRONMENTS[key as ApiEnvironmentKey]
    : API_ENVIRONMENTS[DEFAULT_API_ENVIRONMENT];
}

/** All environments, in display order. */
export const API_ENVIRONMENT_LIST: ApiEnvironment[] = [
  API_ENVIRONMENTS.production,
  API_ENVIRONMENTS.dev,
];
