import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';

import {
  DashboardMobileNav,
  DashboardSidebar,
  PageTransition,
  SkipLink,
} from '@/components/layout';
import { AuthProvider } from '@/features/auth';
import { NotificationsDrawer } from '@/features/notifications';
import { appOnboardingRedirect } from '@/features/onboarding';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';
import { getServerToken, getServerUser } from '@/lib/server-auth';

type AppLayoutProps = { children: ReactNode };

/**
 * Authenticated app shell. Unlike the public `(main)` layout, it renders NO top
 * Header/Footer — the persistent chrome is the left sidebar. Resolves the current
 * user server-side and hydrates the auth store via {@link AuthProvider}. Access
 * is gated by `middleware.ts` (redirects unauthenticated requests to /login).
 */
export default async function AppLayout({ children }: AppLayoutProps) {
  const [user, token, locale] = await Promise.all([
    getServerUser(),
    getServerToken(),
    getServerLocale(),
  ]);
  const { t } = getTranslations(locale);

  // A technician who hasn't finished onboarding (or awaits approval) is sequenced
  // into the `(onboarding)` flow before they can use the dashboard. Customers and
  // approved technicians fall through. Fail-open if the status read fails.
  const onboardingTarget = await appOnboardingRedirect(user, token);
  if (onboardingTarget) redirect(onboardingTarget);

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
