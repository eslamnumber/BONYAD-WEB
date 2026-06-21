'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/avatar';
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
export function variantForRole(role: string | undefined): SidebarVariant {
  // Backend role case isn't guaranteed (may arrive lowercase) — normalise.
  return (role ?? '').toUpperCase() === 'USER' ? 'customer' : 'technician';
}

const SHARED_ITEM =
  'flex h-[38px] w-full items-center justify-end border-e-4 px-4 py-2 text-sm font-medium';
const ACTIVE_ITEM = `${SHARED_ITEM} text-on-media border-primary from-primary/0 to-primary bg-gradient-to-r rtl:bg-gradient-to-l`;
const INACTIVE_ITEM = `${SHARED_ITEM} group text-sidebar-link rounded-s-2xl border-transparent transition-[color,background-color,border-color] duration-200 ease-out motion-safe:hover:bg-nav-hover motion-safe:hover:text-foreground motion-safe:hover:border-primary/40 motion-safe:active:scale-[0.98]`;

// Customer inactive rows are compact 20px text lines (Figma); they share the
// technician hover affordance — background tint + content zoom + icon colour shift.
const CUSTOMER_INACTIVE =
  'group focus-visible:outline-ring flex h-5 w-full items-center justify-end rounded px-4 text-sm font-medium text-sidebar-link transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:bg-nav-hover motion-safe:hover:text-foreground motion-safe:active:scale-[0.98]';

// Inner content row zooms + nudges on hover for both variants.
const ITEM_CONTENT =
  'flex items-center gap-3 transition-transform duration-200 ease-out motion-safe:group-hover:scale-110';

// Icon shifts to the primary colour on row hover (shared by both variants).
const ICON_CLASS = 'motion-safe:group-hover:text-primary size-4 shrink-0 transition-colors';

type SidebarNavProps = {
  variant: SidebarVariant;
  /** Fired when any row is chosen — the mobile drawer uses it to close itself. */
  onNavigate?: () => void;
};

/** Role-aware nav column, shared by the desktop sidebar and the mobile drawer. */
export function SidebarNav({ variant, onNavigate }: SidebarNavProps) {
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
          onNavigate={onNavigate}
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
  onNavigate?: () => void;
};

function SidebarNavLink({
  item,
  variant,
  label,
  active,
  onNotifications,
  onNavigate,
}: NavLinkProps) {
  const { Icon, href } = item;
  const isCustomer = variant === 'customer';
  const inactiveClass = isCustomer ? CUSTOMER_INACTIVE : INACTIVE_ITEM;
  const content = (
    <span className={ITEM_CONTENT}>
      <span>{label}</span>
      <Icon className={ICON_CLASS} aria-hidden />
    </span>
  );

  if (href === null) {
    return (
      <button
        type="button"
        onClick={() => {
          onNotifications();
          onNavigate?.();
        }}
        className={inactiveClass}
      >
        {content}
      </button>
    );
  }
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      className={active ? ACTIVE_ITEM : inactiveClass}
    >
      {content}
    </Link>
  );
}

/** Profile card (name + role + avatar) wrapped in the account menu — both roles. */
export function SidebarProfile() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const roleKey = user ? ROLE_LABEL_KEY[(user.role ?? '').toUpperCase()] : undefined;

  const card = (
    <div className="flex w-52 items-start justify-end gap-4 rounded-lg p-2">
      <div className="flex flex-col items-end gap-1 leading-5">
        {/* Name is user-generated → dir="auto"; role is a static label → follows document dir. */}
        <p className="text-foreground text-sm font-semibold" dir="auto">
          {user?.name}
        </p>
        {roleKey ? (
          <p className="text-foreground/60 text-sm">{t(`dashboard.role.${roleKey}`)}</p>
        ) : null}
      </div>
      <Avatar name={user?.name} src={user?.profileImage} className="size-[46px]" />
    </div>
  );

  return (
    <SidebarSettingsMenu triggerLabel={t('dashboard.menu.ariaLabel')}>{card}</SidebarSettingsMenu>
  );
}
