import { type ReactNode } from 'react';

import {
  DashboardMobileNav,
  DashboardSidebar,
  PageTransition,
  SkipLink,
} from '@/components/layout';
import { AuthProvider } from '@/features/auth';
import { NotificationsDrawer } from '@/features/notifications';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';
import { getServerUser } from '@/lib/server-auth';

type AppLayoutProps = { children: ReactNode };

/**
 * Authenticated app shell. Unlike the public `(main)` layout, it renders NO top
 * Header/Footer — the persistent chrome is the left sidebar. Resolves the current
 * user server-side and hydrates the auth store via {@link AuthProvider}. Access
 * is gated by `middleware.ts` (redirects unauthenticated requests to /login).
 */
export default async function AppLayout({ children }: AppLayoutProps) {
  const [user, locale] = await Promise.all([getServerUser(), getServerLocale()]);
  const { t } = getTranslations(locale);

  return (
    <AuthProvider initialUser={user}>
      <SkipLink label={t('a11y.skipToMain')} />
      <div className="flex h-dvh overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <DashboardMobileNav />
          <main
            id="main"
            tabIndex={-1}
            className="flex min-h-0 flex-1 flex-col overflow-x-clip overflow-y-auto focus:outline-none"
          >
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
        <DashboardSidebar />
      </div>
      <NotificationsDrawer />
    </AuthProvider>
  );
}
