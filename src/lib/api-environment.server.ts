import { cookies } from 'next/headers';

import { apiEnvironmentFromKey, type ApiEnvironment } from '@/config/api-environments';
import { API_ENV_COOKIE_NAME } from '@/config/constants';
import { resolveBackendBaseUrl } from '@/lib/backend';

/**
 * Server-only resolver for the active backend environment. The web analogue of
 * the Android EnvironmentManager: reads the persisted `bonyad-api-env` cookie
 * (within a request scope) so the proxy and RSC layer route to the selected
 * host. Calling outside a request scope throws — that's the intended guard.
 */

/** The selected environment, or production when the cookie is absent/corrupt. */
export async function getActiveEnvironment(): Promise<ApiEnvironment> {
  const store = await cookies();
  return apiEnvironmentFromKey(store.get(API_ENV_COOKIE_NAME)?.value);
}

/** Backend API base URL for the selected environment — pass to `apiClient`. */
export async function getActiveBackendBaseUrl(): Promise<string> {
  const store = await cookies();
  return resolveBackendBaseUrl(store.get(API_ENV_COOKIE_NAME)?.value);
}
