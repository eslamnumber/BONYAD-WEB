import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { type ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';

import { i18n } from '@/lib/i18n';

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" enableSystem={false} disableTransitionOnChange>
          <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
        </ThemeProvider>
      </QueryClientProvider>
    ),
    ...options,
  });
}

// Re-export the rest of @testing-library/react so test files can do
// `import { fireEvent, screen, ... } from '@/testing/render'`.
export * from '@testing-library/react';
