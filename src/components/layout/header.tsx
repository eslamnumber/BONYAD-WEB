import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

import { LogoIcon, NavGlobeIcon } from '@/components/icons';
import { LanguageToggle } from '@/components/layout/language-toggle';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { ROUTES } from '@/config/routes';
import { type Locale } from '@/types/locale';

import { NAV_LINKS } from './nav-links';

type HeaderProps = {
  locale: Locale;
  labels: {
    siteName: string;
    nav: {
      services: string;
      howItWorks: string;
      about: string;
      blog: string;
      contact: string;
      login: string;
      getStarted: string;
      openMenu: string;
      closeMenu: string;
    };
    languageToggle: { ariaLabel: string; switchTo: string };
    themeToggle: { ariaLabel: string; labels: { light: string; dark: string; system: string } };
  };
};

function HeaderControls({ locale, labels }: HeaderProps) {
  return (
    <div className="flex items-center gap-1">
      <MobileMenu navAriaLabel={labels.siteName} labels={labels.nav} />
      <Link
        href={ROUTES.REGISTER}
        className="bg-primary text-primary-foreground hidden rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-200 motion-safe:hover:opacity-90 md:inline-flex md:items-center"
      >
        {labels.nav.getStarted}
      </Link>
      <Link
        href={ROUTES.LOGIN}
        className="text-foreground motion-safe:hover:bg-nav-hover hidden rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 md:inline-flex md:items-center"
      >
        {labels.nav.login}
      </Link>
      <LanguageToggle
        current={locale}
        ariaLabel={labels.languageToggle.ariaLabel}
        switchToLabel={labels.languageToggle.switchTo}
        icon={<NavGlobeIcon className="size-5" aria-hidden />}
      />
      <ThemeToggle ariaLabel={labels.themeToggle.ariaLabel} labels={labels.themeToggle.labels} />
    </div>
  );
}

export function Header({ locale, labels }: HeaderProps) {
  return (
    <header className="border-header-border bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-6">
        {/*
         * Controls — DOM first = logical start.
         * ar → ltr (LTR): start = LEFT  → controls on LEFT  (Figma Arabic design ✓)
         * en → rtl (RTL): start = RIGHT → controls on RIGHT (conventional English ✓)
         */}
        <HeaderControls locale={locale} labels={labels} />

        {/* Nav links — center */}
        <nav
          aria-label={labels.siteName}
          className="hidden items-center gap-1 text-sm font-medium md:flex"
        >
          {NAV_LINKS.map(({ route, key, hasDropdown }) => (
            <Link
              key={route}
              href={route}
              className="text-foreground/80 motion-safe:hover:bg-nav-hover motion-safe:hover:text-foreground flex items-center gap-1 rounded-md px-3 py-2 transition-colors duration-200"
            >
              {hasDropdown && <ChevronDown className="size-4 shrink-0" aria-hidden />}
              {labels.nav[key]}
            </Link>
          ))}
        </nav>

        {/*
         * Logo — DOM last = logical end.
         * ar → ltr (LTR): end = RIGHT → logo on RIGHT (Figma Arabic design ✓)
         * en → rtl (RTL): end = LEFT  → logo on LEFT  (conventional English ✓)
         */}
        <Link
          href={ROUTES.HOME}
          aria-label={labels.siteName}
          className="focus-visible:outline-ring shrink-0 rounded focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <LogoIcon className="h-10 w-auto" aria-hidden />
          <span className="sr-only">{labels.siteName}</span>
        </Link>
      </div>
    </header>
  );
}
