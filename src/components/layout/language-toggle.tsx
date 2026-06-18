'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { switchLocale } from '@/lib/locale-switch';
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
    switchLocale(next, () => router.refresh());
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
