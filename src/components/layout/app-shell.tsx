import { type ReactNode } from 'react';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { SkipLink } from '@/components/layout/skip-link';
import type { Locale } from '@/types/locale';

type AppShellProps = {
  locale: Locale;
  children: ReactNode;
  labels: {
    skipToMain: string;
    header: React.ComponentProps<typeof Header>['labels'];
    footer: React.ComponentProps<typeof Footer>['labels'];
  };
};

/**
 * Public site shell: skip link → header → main → footer.
 * Server Component — locale + label tree come from the layout that mounts it.
 */
export function AppShell({ locale, labels, children }: AppShellProps) {
  return (
    <>
      <SkipLink label={labels.skipToMain} />
      <Header locale={locale} labels={labels.header} />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer labels={labels.footer} />
    </>
  );
}
