import { z } from 'zod';

/**
 * Environment variables — the ONLY place in the codebase allowed to read `process.env`.
 * Every other module imports the typed `env` export below.
 * ESLint enforces this rule (`no-restricted-globals: process`).
 *
 * Schema is split into:
 *   - `clientSchema` — `NEXT_PUBLIC_*` vars exposed to the browser.
 *   - `serverSchema` — server-only secrets. Must NEVER be prefixed with NEXT_PUBLIC_.
 *
 * On the server, both schemas are merged. On the client, only `clientSchema` is checked.
 * Missing required vars throw at boot — fail loud, not silent.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_BASE_URL: z.url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
  NEXT_PUBLIC_ANALYTICS_KEY: z.string().optional(),
  /**
   * MQTT-over-WebSocket broker URL for realtime chat. The browser connects here
   * directly; the broker origin must also be allow-listed in the CSP
   * `connect-src` (see `src/middleware.ts`). Defaults to the production broker.
   */
  NEXT_PUBLIC_MQTT_BROKER_URL: z.url().default('wss://admin.bonyad-hub.com/mqtt'),
  /**
   * Google Maps JavaScript SDK key for the location picker (Places autocomplete +
   * geocoding). Public by design (shipped in the client bundle); restrict by HTTP
   * referrer in the Google Cloud Console. Mirrors the legacy RN app's key. The Maps
   * script + XHR origins are allow-listed in the CSP (`src/middleware.ts`).
   */
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().default('AIzaSyA0bEyvVa8NecLryi5DOiEjXQvOQ3p0CfA'),
  /**
   * HyperPay COPYandPAY widget host selector — TEST → eu-test.oppwa.com, LIVE →
   * eu-prod.oppwa.com. **Temporary fallback only:** the authoritative source is the
   * `mode` field on the create-checkout response (driven by the backend admin toggle).
   * Used solely when that field is absent; remove once the backend always returns it.
   */
  NEXT_PUBLIC_HYPERPAY_MODE: z.enum(['TEST', 'LIVE']).default('TEST'),
});

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SERVER_API_PROXY_TOKEN: z.string().min(32).optional(),
  REVALIDATE_SECRET: z.string().min(32).optional(),
  UPSTASH_REDIS_REST_URL: z.url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(20).optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
});

const isServer = typeof window === 'undefined';

const raw = process.env;

const clientRaw = {
  NEXT_PUBLIC_SITE_URL: raw.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_API_BASE_URL: raw.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_SENTRY_DSN: raw.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_ANALYTICS_KEY: raw.NEXT_PUBLIC_ANALYTICS_KEY,
  NEXT_PUBLIC_MQTT_BROKER_URL: raw.NEXT_PUBLIC_MQTT_BROKER_URL,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: raw.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  NEXT_PUBLIC_HYPERPAY_MODE: raw.NEXT_PUBLIC_HYPERPAY_MODE,
};

const parsed = isServer
  ? serverSchema.merge(clientSchema).safeParse(raw)
  : clientSchema.safeParse(clientRaw);

if (!parsed.success) {
  // Fail loud at boot. Easier to debug than silent undefined later.
  console.error('❌ Invalid environment variables:', parsed.error.issues);
  throw new Error('Invalid environment variables — see logs above.');
}

export const env = parsed.data;

/** Convenience flag — true when running locally in `next dev`. */
export const isDevelopment = (env as { NODE_ENV?: string }).NODE_ENV === 'development';

/** Convenience flag — true when running tests under Vitest/Playwright. */
export const isTest = (env as { NODE_ENV?: string }).NODE_ENV === 'test';
