import type { ComponentType, SVGProps } from 'react';

import {
  DashboardHomeIcon,
  DashboardJobOffersIcon,
  DashboardMessagesIcon,
  DashboardNotificationsIcon,
  DashboardPaymentsIcon,
  DashboardProjectsIcon,
  DashboardSettingsIcon,
} from '@/components/icons';
import { ROUTES } from '@/config/routes';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type SidebarVariant = 'technician' | 'customer';

export type SidebarNavItem = {
  /** `null` renders a button that opens the notifications drawer instead of a link. */
  href: string | null;
  /** i18n key under `dashboard.nav`. */
  key: string;
  Icon: IconComponent;
};

/** Service-provider nav — unchanged from the original sidebar. */
export const TECHNICIAN_NAV: readonly SidebarNavItem[] = [
  { href: ROUTES.DASHBOARD, key: 'jobOffers', Icon: DashboardJobOffersIcon },
  { href: ROUTES.DASHBOARD_PROJECTS, key: 'projects', Icon: DashboardProjectsIcon },
  { href: ROUTES.DASHBOARD_PAYMENTS, key: 'payments', Icon: DashboardPaymentsIcon },
  { href: ROUTES.DASHBOARD_MESSAGES, key: 'messages', Icon: DashboardMessagesIcon },
  { href: null, key: 'notifications', Icon: DashboardNotificationsIcon },
  { href: ROUTES.DASHBOARD_SETTINGS, key: 'settings', Icon: DashboardSettingsIcon },
];

/**
 * Customer (USER) nav — Home / Projects / Messages / Notifications / Settings.
 */
export const CUSTOMER_NAV: readonly SidebarNavItem[] = [
  { href: ROUTES.DASHBOARD, key: 'home', Icon: DashboardHomeIcon },
  { href: ROUTES.DASHBOARD_PROJECTS, key: 'projects', Icon: DashboardProjectsIcon },
  { href: ROUTES.DASHBOARD_MESSAGES, key: 'messages', Icon: DashboardMessagesIcon },
  { href: null, key: 'notifications', Icon: DashboardNotificationsIcon },
  { href: ROUTES.DASHBOARD_SETTINGS, key: 'settings', Icon: DashboardSettingsIcon },
];

export const SIDEBAR_NAV: Record<SidebarVariant, readonly SidebarNavItem[]> = {
  technician: TECHNICIAN_NAV,
  customer: CUSTOMER_NAV,
};

/**
 * The "Job offers" / "Home" item points at `/dashboard` but stays active on the
 * job-offer detail routes too, so the sidebar still highlights it while a detail
 * is open. (Customers never hit the job-offers subpath, so it reduces to an exact
 * `/dashboard` match for them.)
 */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === ROUTES.DASHBOARD) {
    return pathname === ROUTES.DASHBOARD || pathname.startsWith(ROUTES.DASHBOARD_JOB_OFFERS);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
