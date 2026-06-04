'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { LogoIcon, NavGlobeIcon } from '@/components/icons';
import { LanguageToggle } from '@/components/layout/language-toggle';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { type Locale } from '@/types/locale';

export type AuthHeaderLabels = {
  brandName: string;
  back: string;
  backAriaLabel: string;
  languageToggle: { ariaLabel: string; switchTo: string };
  themeToggle: { ariaLabel: string; labels: { light: string; dark: string; system: string } };
};

type AuthHeaderProps = { locale: Locale; labels: AuthHeaderLabels };

/**
 * Top bar for the auth screens: a browser-history back button at the logical
 * start, with the language + theme toggles (and the mobile-only logo) at the
 * logical end. The desktop logo lives in each screen's image panel, so it is
 * hidden here past `lg`.
 */
export function AuthHeader({ locale, labels }: AuthHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex h-[78px] shrink-0 items-center justify-between gap-2 px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={labels.backAriaLabel}
        title={labels.back}
        onClick={() => router.back()}
      >
        <ChevronRight className="ltr:-scale-x-100" aria-hidden />
      </Button>
      <div className="flex items-center gap-1">
        <LanguageToggle
          current={locale}
          ariaLabel={labels.languageToggle.ariaLabel}
          switchToLabel={labels.languageToggle.switchTo}
          icon={<NavGlobeIcon className="size-5" aria-hidden />}
        />
        <ThemeToggle ariaLabel={labels.themeToggle.ariaLabel} labels={labels.themeToggle.labels} />
        <Link
          href={ROUTES.HOME}
          aria-label={labels.brandName}
          className="focus-visible:outline-ring ms-1 rounded focus-visible:outline-2 focus-visible:outline-offset-4 lg:hidden"
        >
          <LogoIcon className="h-10 w-auto" aria-hidden />
          <span className="sr-only">{labels.brandName}</span>
        </Link>
      </div>
    </header>
  );
}
