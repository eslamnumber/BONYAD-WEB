'use client';

import { useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { LogoIcon, NavGlobeIcon } from '@/components/icons';
import { LanguageToggle } from '@/components/layout/language-toggle';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';
import { INTERNAL_API, ROUTES } from '@/config/routes';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { type Locale } from '@/types/locale';

/**
 * Onboarding top bar — mirrors the auth header's toggles + mobile logo, but the
 * leading control is "Sign out" (an unapproved technician must not be trapped),
 * not browser-back. Logout is inlined (rule 6 keeps it out of the auth feature):
 * clear the cookie route, the store, and the query cache, then return to login.
 */
function useOnboardingLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);
  return async () => {
    await apiClient
      .post<{ ok: boolean }>(INTERNAL_API.AUTH_LOGOUT, { internal: true })
      .catch(() => undefined);
    clearSession();
    queryClient.clear();
    router.replace(ROUTES.LOGIN);
  };
}

export function OnboardingHeader() {
  const { t, i18n } = useTranslation();
  const current: Locale = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const logout = useOnboardingLogout();

  return (
    <header className="flex h-[78px] shrink-0 items-center justify-between gap-2 px-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => void logout()}
        className="gap-2"
      >
        <LogOut className="size-5" aria-hidden />
        {t('onboarding.logout')}
      </Button>
      <div className="flex items-center gap-1">
        <LanguageToggle
          current={current}
          ariaLabel={t('language.ariaLabel')}
          switchToLabel={
            current === 'en' ? t('language.switchToArabic') : t('language.switchToEnglish')
          }
          icon={<NavGlobeIcon className="size-5" aria-hidden />}
        />
        <ThemeToggle
          ariaLabel={t('theme.ariaLabel')}
          labels={{ light: t('theme.light'), dark: t('theme.dark'), system: t('theme.system') }}
        />
        <Link
          href={ROUTES.HOME}
          aria-label={t('site.name')}
          className="focus-visible:outline-ring ms-1 rounded focus-visible:outline-2 focus-visible:outline-offset-4 lg:hidden"
        >
          <LogoIcon className="h-10 w-auto" aria-hidden />
          <span className="sr-only">{t('site.name')}</span>
        </Link>
      </div>
    </header>
  );
}
