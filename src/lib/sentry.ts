import * as Sentry from '@sentry/nextjs';

import { env, isDevelopment } from '@/config/env';

/**
 * Sentry wrapper — initialization, error capture, message capture.
 *
 * Local-dev behaviour:
 *   - If `NEXT_PUBLIC_SENTRY_DSN` is empty, every function is a no-op.
 *   - No DSN logs, no upstream requests, no telemetry.
 *
 * When DSN is set (staging / production):
 *   - 401 ApiErrors are filtered out (expected during the auth refresh dance).
 *   - Release tag = git SHA (set by CI when present).
 *   - Environment tag = NODE_ENV.
 */

let initialized = false;

export function initSentry(): void {
  if (initialized) return;
  initialized = true;

  const dsn = env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || isDevelopment) return;

  Sentry.init({
    dsn,
    environment: (env as { NODE_ENV?: string }).NODE_ENV ?? 'production',
    tracesSampleRate: 0.1,
    beforeSend(event, hint) {
      const error = hint.originalException as { status?: number } | undefined;
      // Suppress noisy expected errors (auth-refresh handles 401s in-band).
      if (error?.status === 401) return null;
      return event;
    },
  });
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!env.NEXT_PUBLIC_SENTRY_DSN || isDevelopment) {
    // Local: log to console.error so the developer can still see the error.
    console.error('[sentry stub]', error, context);
    return;
  }
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  if (!env.NEXT_PUBLIC_SENTRY_DSN || isDevelopment) {
    console.warn(`[sentry stub] ${level}: ${message}`);
    return;
  }
  Sentry.captureMessage(message, level);
}
