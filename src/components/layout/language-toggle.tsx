'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { LOCALE_COOKIE_NAME } from '@/config/constants';
import { i18n } from '@/lib/i18n';
import { type Locale } from '@/types/locale';

type LanguageToggleProps = {
  current: Locale;
  ariaLabel: string;
  switchToLabel: string;
  icon?: ReactNode;
};

export function LanguageToggle({ current, ariaLabel, switchToLabel, icon }: LanguageToggleProps) {
  const router = useRouter();

  function toggle() {
    const next: Locale = current === 'en' ? 'ar' : 'en';
    void i18n.changeLanguage(next);
    document.cookie = `${LOCALE_COOKIE_NAME}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={icon ? 'icon' : 'sm'}
      aria-label={ariaLabel}
      title={switchToLabel}
      onClick={toggle}
      className="gap-1"
    >
      {icon ?? switchToLabel}
    </Button>
  );
}
