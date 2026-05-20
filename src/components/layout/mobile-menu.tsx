'use client';

import { ChevronDown, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { startTransition, useEffect, useState } from 'react';

import { ROUTES } from '@/config/routes';

import { NAV_LINKS } from './nav-links';

export type MobileMenuLabels = {
  openMenu: string;
  closeMenu: string;
  services: string;
  howItWorks: string;
  about: string;
  blog: string;
  contact: string;
  login: string;
  getStarted: string;
};

type DrawerProps = {
  navAriaLabel: string;
  labels: MobileMenuLabels;
  onClose: () => void;
};

function MobileMenuDrawer({ navAriaLabel, labels, onClose }: DrawerProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />
      <div
        id="mobile-nav"
        className="border-header-border bg-background fixed inset-x-0 top-[72px] z-50 border-b shadow-lg"
      >
        <nav aria-label={navAriaLabel} className="flex flex-col px-6 py-2">
          {NAV_LINKS.map(({ route, key, hasDropdown }) => (
            <Link
              key={route}
              href={route}
              className="text-foreground/80 motion-safe:hover:bg-nav-hover motion-safe:hover:text-foreground flex items-center gap-1 rounded-md px-3 py-3 text-sm font-medium transition-colors duration-200"
            >
              {hasDropdown && <ChevronDown className="size-4 shrink-0" aria-hidden />}
              {labels[key]}
            </Link>
          ))}
        </nav>
        <div className="border-header-border flex flex-col gap-2 border-t px-6 py-4">
          <Link
            href={ROUTES.REGISTER}
            className="bg-primary text-primary-foreground flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-200 motion-safe:hover:opacity-90"
          >
            {labels.getStarted}
          </Link>
          <Link
            href={ROUTES.LOGIN}
            className="text-foreground motion-safe:hover:bg-nav-hover flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200"
          >
            {labels.login}
          </Link>
        </div>
      </div>
    </>
  );
}

type MobileMenuProps = { navAriaLabel: string; labels: MobileMenuLabels };

export function MobileMenu({ navAriaLabel, labels }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    startTransition(() => setOpen(false));
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? labels.closeMenu : labels.openMenu}
        onClick={() => setOpen((prev) => !prev)}
        className="text-foreground motion-safe:hover:bg-nav-hover rounded-md p-2 transition-colors duration-200"
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>
      {open && (
        <MobileMenuDrawer
          navAriaLabel={navAriaLabel}
          labels={labels}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
