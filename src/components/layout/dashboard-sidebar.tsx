'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import {
  DashboardJobOffersIcon,
  DashboardMessagesIcon,
  DashboardNotificationsIcon,
  DashboardPaymentsIcon,
  DashboardProjectsIcon,
  DashboardSettingsIcon,
  LogoIcon,
} from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';

const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, key: 'jobOffers', Icon: DashboardJobOffersIcon },
  { href: ROUTES.DASHBOARD_PROJECTS, key: 'projects', Icon: DashboardProjectsIcon },
  { href: ROUTES.DASHBOARD_PAYMENTS, key: 'payments', Icon: DashboardPaymentsIcon },
  { href: ROUTES.DASHBOARD_MESSAGES, key: 'messages', Icon: DashboardMessagesIcon },
  { href: null, key: 'notifications', Icon: DashboardNotificationsIcon },
  { href: ROUTES.DASHBOARD_SETTINGS, key: 'settings', Icon: DashboardSettingsIcon },
] as const;

/**
 * The "Job offers" item points at the job-offers list (`/dashboard`) but stays
 * active on the job-offer detail routes too (`/dashboard/job-offers/[id]`), so
 * the sidebar still highlights it while a project detail is open.
 */
function isNavActive(pathname: string, href: string): boolean {
  if (href === ROUTES.DASHBOARD) {
    return pathname === ROUTES.DASHBOARD || pathname.startsWith(ROUTES.DASHBOARD_JOB_OFFERS);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Maps the backend auth role to a localized sidebar label key. */
const ROLE_LABEL_KEY: Record<string, string> = {
  TECHNICIAN: 'technician',
  USER: 'customer',
};

const SHARED_ITEM =
  'flex h-[38px] w-full items-center justify-end border-e-4 px-4 py-2 text-sm font-medium';
const ACTIVE_ITEM = `${SHARED_ITEM} text-on-media border-primary from-primary/0 to-primary bg-gradient-to-r rtl:bg-gradient-to-l`;
const INACTIVE_ITEM = `${SHARED_ITEM} group text-sidebar-link rounded-s-2xl border-transparent transition-[color,background-color,border-color] duration-200 ease-out motion-safe:hover:bg-nav-hover motion-safe:hover:text-foreground motion-safe:hover:border-primary/40 motion-safe:active:scale-[0.98]`;

// Inner content row — zooms + nudges toward the active edge on hover so the
// label and icon visibly react, not just the background.
const ITEM_CONTENT =
  'flex items-center gap-3 transition-transform duration-200 ease-out motion-safe:group-hover:scale-110';

/**
 * Authenticated app sidebar — persistent right-hand chrome for the `(app)`
 * surface (the counterpart to the public `<Header>`). Logo + primary nav with an
 * active "primary button" variant + the current-user profile card. Profile data
 * comes from the hydrated auth store; the avatar falls back to initials. Desktop
 * only (`hidden lg:flex`) — the mobile drawer is a separate, later task.
 */
export function DashboardSidebar() {
  const { t } = useTranslation();

  return (
    <aside
      aria-label={t('dashboard.sidebarAriaLabel')}
      className="bg-dashboard-panel hidden w-72 shrink-0 flex-col px-10 pt-11 pb-6 lg:sticky lg:top-0 lg:flex lg:h-dvh"
    >
      <div className="flex h-full flex-col items-end justify-between">
        <div className="flex flex-col items-end gap-11">
          <Link
            href={ROUTES.DASHBOARD}
            aria-label={t('site.name')}
            className="focus-visible:outline-ring rounded focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <LogoIcon className="h-10 w-auto" aria-hidden />
            <span className="sr-only">{t('site.name')}</span>
          </Link>
          <SidebarNav />
        </div>
        <SidebarProfile />
      </div>
    </aside>
  );
}

function SidebarNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const openNotifications = useNotificationsStore((s) => s.open);

  return (
    <nav
      aria-label={t('dashboard.sidebarAriaLabel')}
      className="flex w-52 flex-col items-end gap-4"
    >
      {NAV_ITEMS.map(({ href, key, Icon }) => {
        const content = (
          <span className={ITEM_CONTENT}>
            <span>{t(`dashboard.nav.${key}`)}</span>
            <Icon
              className="motion-safe:group-hover:text-primary size-4 shrink-0 transition-colors"
              aria-hidden
            />
          </span>
        );

        if (href === null) {
          return (
            <button key={key} type="button" onClick={openNotifications} className={INACTIVE_ITEM}>
              {content}
            </button>
          );
        }

        const active = isNavActive(pathname, href);
        return (
          <Link
            key={key}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={active ? ACTIVE_ITEM : INACTIVE_ITEM}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarProfile() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const roleKey = user ? ROLE_LABEL_KEY[user.role] : undefined;

  return (
    <div className="flex w-52 items-start justify-end gap-4 rounded-lg p-2">
      <div className="flex flex-col items-end gap-1 leading-5">
        <p className="text-foreground text-sm font-semibold" dir="auto">
          {user?.name}
        </p>
        {roleKey ? (
          <p className="text-foreground/60 text-sm" dir="auto">
            {t(`dashboard.role.${roleKey}`)}
          </p>
        ) : null}
      </div>
      <Avatar name={user?.name} src={user?.profileImage} className="size-[46px]" />
    </div>
  );
}
