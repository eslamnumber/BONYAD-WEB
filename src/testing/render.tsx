import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { type ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';

import { i18n } from '@/lib/i18n';

/**
 * Renders `ui` wrapped in the same providers used in production:
 *   - `next-themes` ThemeProvider (light/dark)
 *   - i18next provider (already initialized in setup.ts with locale `en`)
 *
 * When more providers join the tree (QueryClient, Tooltip, etc.), add them here.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider attribute="class" enableSystem={false} disableTransitionOnChange>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </ThemeProvider>
    ),
    ...options,
  });
}

// Re-export the rest of @testing-library/react so test files can do
// `import { fireEvent, screen, ... } from '@/testing/render'`.
export * from '@testing-library/react';
