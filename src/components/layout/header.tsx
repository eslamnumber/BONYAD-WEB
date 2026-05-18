import Link from 'next/link';

import { LogoIcon, NavGlobeIcon } from '@/components/icons';
import { LanguageToggle } from '@/components/layout/language-toggle';
import { ROUTES } from '@/config/routes';
import { type Locale } from '@/types/locale';

type HeaderProps = {
  locale: Locale;
  labels: {
    siteName: string;
    nav: { services: string; technicians: string; blog: string; help: string; contact: string };
    languageToggle: { ariaLabel: string; switchTo: string };
  };
};

const NAV_LINKS = [
  { route: ROUTES.SERVICES, key: 'services' as const },
  { route: ROUTES.TECHNICIANS, key: 'technicians' as const },
  { route: ROUTES.BLOG, key: 'blog' as const },
  { route: ROUTES.HELP, key: 'help' as const },
  { route: ROUTES.CONTACT, key: 'contact' as const },
];

export function Header({ locale, labels }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-6">
        {/* Logo — start side. Figma's RTL design puts the logo at the visual right;
            in RTL `start` resolves to the right, so this order matches the design
            in Arabic and gives the conventional logo-left in English. */}
        <Link
          href={ROUTES.HOME}
          aria-label={labels.siteName}
          className="shrink-0 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <LogoIcon className="h-10 w-auto" aria-hidden />
          <span className="sr-only">{labels.siteName}</span>
        </Link>

        {/* Nav links — center */}
        <nav aria-label={labels.siteName} className="hidden items-center gap-1 text-sm font-medium md:flex">
          {NAV_LINKS.map(({ route, key }) => (
            <Link
              key={route}
              href={route}
              className="rounded-md px-3 py-2 text-foreground/80 transition-colors duration-200 motion-safe:hover:bg-nav-hover motion-safe:hover:text-foreground"
            >
              {labels.nav[key]}
            </Link>
          ))}
        </nav>

        {/* Controls — end side (visual left in RTL, visual right in LTR). */}
        <LanguageToggle
          current={locale}
          ariaLabel={labels.languageToggle.ariaLabel}
          switchToLabel={labels.languageToggle.switchTo}
          icon={<NavGlobeIcon className="size-5" aria-hidden />}
        />
      </div>
    </header>
  );
}
