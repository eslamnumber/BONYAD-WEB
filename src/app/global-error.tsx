'use client';

import { useEffect } from 'react';

import { captureException } from '@/lib/sentry';

// Last-resort error boundary — replaces the root layout when it itself crashes.
// Must render <html> + <body> because the layout failed to.
// TODO(i18n, Phase 6): t() all strings (English-only is acceptable for the crash screen).

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    captureException(error, { digest: error.digest, scope: 'global-error' });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '40rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 600, marginBottom: '1rem' }}>
            We&rsquo;re sorry — something broke.
          </h1>
          <p style={{ marginBottom: '1.5rem', opacity: 0.8 }}>
            The application encountered an unexpected error. Please refresh, or try again later.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '0.625rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '0.375rem',
              border: '1px solid currentColor',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
