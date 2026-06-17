'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { LogoIcon } from '@/components/icons';
import { DemoBanner } from '@/components/layout/demo-banner';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/auth-store';

import { SidebarNav, SidebarProfile, variantForRole } from './dashboard-sidebar-content';

/**
 * Authenticated app sidebar — persistent right-hand chrome for the `(app)`
 * surface. Role-aware: technicians get the original nav; customers (USER) get the
 * Figma "Dashboard-User" nav plus an account menu on the profile card. Desktop
 * only (`hidden lg:flex`); the small-screen surface is the dropdown in
 * {@link DashboardMobileNav}, which reuses the same nav + profile pieces.
 */
export function DashboardSidebar() {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.user?.role);
  const variant = variantForRole(role);

  return (
    <aside
      aria-label={t('dashboard.sidebarAriaLabel')}
      className="bg-dashboard-panel hidden w-72 shrink-0 flex-col px-10 pt-11 pb-6 lg:sticky lg:top-0 lg:flex lg:h-dvh"
    >
      <DemoBanner label={t('common.demoBanner')} className="-mx-10 -mt-11 mb-8" />
      <div className="flex min-h-0 flex-1 flex-col items-end justify-between">
        <div className="flex flex-col items-end gap-11">
          <Link
            href={ROUTES.DASHBOARD}
            aria-label={t('site.name')}
            className="focus-visible:outline-ring rounded focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <LogoIcon className="h-10 w-auto" aria-hidden />
            <span className="sr-only">{t('site.name')}</span>
          </Link>
          <SidebarNav variant={variant} />
        </div>
        <SidebarProfile variant={variant} />
      </div>
    </aside>
  );
}
