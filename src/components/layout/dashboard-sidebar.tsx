'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
import { LogoIcon } from '@/components/icons';
import { DemoBanner } from '@/components/layout/demo-banner';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';

import {
  SIDEBAR_NAV,
  isNavActive,
  type SidebarNavItem,
  type SidebarVariant,
} from './sidebar-nav-config';
import { SidebarSettingsMenu } from './sidebar-settings-menu';

/** Maps the backend auth role to a localized sidebar label key. */
const ROLE_LABEL_KEY: Record<string, string> = {
  TECHNICIAN: 'technician',
  USER: 'customer',
};

/** Customers (USER) get the compact Figma nav + account menu; everyone else keeps the original. */
function variantForRole(role: string | undefined): SidebarVariant {
  // Backend role case isn't guaranteed (may arrive lowercase) — normalise.
  return (role ?? '').toUpperCase() === 'USER' ? 'customer' : 'technician';
}

const SHARED_ITEM =
  'flex h-[38px] w-full items-center justify-end border-e-4 px-4 py-2 text-sm font-medium';
const ACTIVE_ITEM = `${SHARED_ITEM} text-on-media border-primary from-primary/0 to-primary bg-gradient-to-r rtl:bg-gradient-to-l`;
const INACTIVE_ITEM = `${SHARED_ITEM} group text-sidebar-link rounded-s-2xl border-transparent transition-[color,background-color,border-color] duration-200 ease-out motion-safe:hover:bg-nav-hover motion-safe:hover:text-foreground motion-safe:hover:border-primary/40 motion-safe:active:scale-[0.98]`;

// Customer inactive rows are compact 20px text lines (Figma) — no border/box,
// just a colour-shift on hover; the icon follows via currentColor.
const CUSTOMER_INACTIVE =
  'group focus-visible:outline-ring flex h-5 w-full items-center justify-end rounded px-4 text-sm font-medium text-sidebar-link transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:text-foreground';

// Inner content row — technician variant zooms + nudges on hover; customer is flat.
const ITEM_CONTENT_TECH =
  'flex items-center gap-3 transition-transform duration-200 ease-out motion-safe:group-hover:scale-110';
const ITEM_CONTENT = 'flex items-center gap-3';

/**
 * Authenticated app sidebar — persistent right-hand chrome for the `(app)`
 * surface. Role-aware: technicians get the original nav; customers (USER) get the
 * Figma "Dashboard-User" nav (Home / Projects / Offers⦁ / Messages / Notifications
 * / Settings) plus an account menu on the profile card. Desktop only
 * (`hidden lg:flex`) — the mobile drawer is a separate, later task.
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

function SidebarNav({ variant }: { variant: SidebarVariant }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const openNotifications = useNotificationsStore((s) => s.open);

  return (
    <nav
      aria-label={t('dashboard.sidebarAriaLabel')}
      className="flex w-52 flex-col items-end gap-4"
    >
      {SIDEBAR_NAV[variant].map((item) => (
        <SidebarNavLink
          key={item.key}
          item={item}
          variant={variant}
          label={t(`dashboard.nav.${item.key}`)}
          active={item.href !== null && isNavActive(pathname, item.href)}
          onNotifications={openNotifications}
        />
      ))}
    </nav>
  );
}

type NavLinkProps = {
  item: SidebarNavItem;
  variant: SidebarVariant;
  label: string;
  active: boolean;
  onNotifications: () => void;
};

function SidebarNavLink({ item, variant, label, active, onNotifications }: NavLinkProps) {
  const { Icon, href, badge } = item;
  const isCustomer = variant === 'customer';
  const inactiveClass = isCustomer ? CUSTOMER_INACTIVE : INACTIVE_ITEM;
  const iconClass = isCustomer
    ? 'size-4 shrink-0'
    : 'motion-safe:group-hover:text-primary size-4 shrink-0 transition-colors';
  const content = (
    <span className={isCustomer ? ITEM_CONTENT : ITEM_CONTENT_TECH}>
      {badge ? <span className="bg-notif-unread size-1.5 rounded-full" aria-hidden /> : null}
      <span>{label}</span>
      <Icon className={iconClass} aria-hidden />
    </span>
  );

  if (href === null) {
    return (
      <button type="button" onClick={onNotifications} className={inactiveClass}>
        {content}
      </button>
    );
  }
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={active ? ACTIVE_ITEM : inactiveClass}
    >
      {content}
    </Link>
  );
}

function SidebarProfile({ variant }: { variant: SidebarVariant }) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const roleKey = user ? ROLE_LABEL_KEY[(user.role ?? '').toUpperCase()] : undefined;

  const card = (
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

  if (variant === 'customer') {
    return (
      <SidebarSettingsMenu triggerLabel={t('dashboard.menu.ariaLabel')}>{card}</SidebarSettingsMenu>
    );
  }
  return card;
}
