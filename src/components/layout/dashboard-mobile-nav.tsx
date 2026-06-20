'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { startTransition, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LogoIcon } from '@/components/icons';
import { DemoBanner } from '@/components/layout/demo-banner';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/auth-store';

import { SidebarNav, SidebarProfile, variantForRole } from './dashboard-sidebar-content';
import { type SidebarVariant } from './sidebar-nav-config';

type DrawerProps = { variant: SidebarVariant; onClose: () => void };

/** Dropdown panel anchored under the mobile bar — the desktop side panel's content. */
function MobileNavDrawer({ variant, onClose }: DrawerProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />
      <div
        id="dashboard-mobile-nav"
        className="border-header-border bg-background absolute inset-x-0 top-full z-50 border-b shadow-lg"
      >
        <div className="flex flex-col items-end px-6 py-6">
          <SidebarNav variant={variant} onNavigate={onClose} />
        </div>
        <div className="border-header-border flex justify-end border-t px-6 py-4">
          <SidebarProfile />
        </div>
      </div>
    </>
  );
}

/**
 * Small-screen header for the authenticated app. The desktop sidebar is
 * `hidden lg:flex`, so on phones/tablets this bar (`lg:hidden`) is the only way
 * into the nav: a hamburger toggles the side-panel content as a dropdown.
 * Closes on Escape, outside click, and whenever a tab is chosen (route change +
 * the `onNavigate` callback so notifications — which don't change the route —
 * close it too).
 */
export function DashboardMobileNav() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);
  const variant = variantForRole(role);

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
    <div className="relative z-50 shrink-0 lg:hidden">
      <DemoBanner label={t('common.demoBanner')} />
      <div className="border-header-border bg-background relative z-50 flex h-[60px] items-center justify-between gap-4 border-b px-4">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="dashboard-mobile-nav"
          aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
          onClick={() => setOpen((prev) => !prev)}
          className="text-foreground motion-safe:hover:bg-nav-hover rounded-md p-2 transition-colors duration-200"
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
        <Link
          href={ROUTES.DASHBOARD}
          aria-label={t('site.name')}
          className="focus-visible:outline-ring rounded focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <LogoIcon className="h-9 w-auto" aria-hidden />
          <span className="sr-only">{t('site.name')}</span>
        </Link>
      </div>
      {open && <MobileNavDrawer variant={variant} onClose={() => setOpen(false)} />}
    </div>
  );
}
