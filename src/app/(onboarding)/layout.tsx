import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';

import { ROUTES } from '@/config/routes';
import { AuthProvider } from '@/features/auth';
import { OnboardingShell, onboardingAreaRedirect } from '@/features/onboarding';
import { getServerToken, getServerUser } from '@/lib/server-auth';

/**
 * Technician onboarding shell (post-signup, pre-dashboard). Resolves the session
 * server-side, hydrates the auth store, and reverse-guards the area: a customer or
 * an already-approved technician is sent to the dashboard, and a technician on the
 * wrong step is moved to the right one. The auth redirect itself is handled by
 * `middleware.ts` (these routes are in the protected prefixes).
 */
export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const [user, token] = await Promise.all([getServerUser(), getServerToken()]);
  if (!user) redirect(ROUTES.LOGIN);

  const currentPath = (await headers()).get('x-pathname') ?? '';
  const target = await onboardingAreaRedirect(user, token, currentPath);
  if (target) redirect(target);

  return (
    <AuthProvider initialUser={user}>
      <OnboardingShell>{children}</OnboardingShell>
    </AuthProvider>
  );
}
