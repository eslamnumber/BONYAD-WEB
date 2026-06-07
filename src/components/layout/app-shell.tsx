import { type ReactNode } from 'react';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { SkipLink } from '@/components/layout/skip-link';
import type { Locale } from '@/types/locale';

type AppShellProps = {
  locale: Locale;
  children: ReactNode;
  /** Optional banner rendered above the header (e.g. the mobile app-download bar). */
  topBanner?: ReactNode;
  labels: {
    skipToMain: string;
    header: React.ComponentProps<typeof Header>['labels'];
    footer: React.ComponentProps<typeof Footer>['labels'];
  };
};

/**
 * Public site shell: skip link → top banner → header → main → footer.
 * Server Component — locale + label tree come from the layout that mounts it.
 */
export function AppShell({ locale, labels, children, topBanner }: AppShellProps) {
  return (
    <>
      <SkipLink label={labels.skipToMain} />
      {topBanner}
      <Header locale={locale} labels={labels.header} />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer labels={labels.footer} />
    </>
  );
}
