import type { ComponentType, SVGProps } from 'react';

import {
  CloseIcon,
  DashboardJobOffersIcon,
  DashboardPaymentsIcon,
  DashboardProjectsIcon,
  FeatureVerifiedIcon,
  MessageCircleIcon,
  PersonIcon,
  SaudiRiyalIcon,
  SendIcon,
  TrustBadgeIcon,
  TrustSupportIcon,
} from '@/components/icons';
import { ROUTES } from '@/config/routes';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type ProfileLinkRow = {
  /** i18n key: title at `profile.rows.<key>.title`, subtitle at `.subtitle`. */
  key: string;
  Icon: IconComponent;
  href: string;
  /** Hidden for customers (USER); shown only to technicians. */
  technicianOnly?: boolean;
  /** Rendered greyed-out and non-interactive (visible but can't be opened). */
  disabled?: boolean;
  tone?: 'default' | 'danger';
};

/**
 * Account hub navigation rows. Each links to a profile sub-screen (placeholders
 * for now). `technicianOnly` rows are filtered out for customers. Every icon is a
 * real Bonyad export from `src/components/icons` (rule 21 — no invented icons),
 * picked for the closest on-brand semantic: completed work → projects glyph,
 * money/contracts → the Saudi-Riyal mark, referral → send, delete → close.
 */
export const ACCOUNT_ROWS: readonly ProfileLinkRow[] = [
  { key: 'myInfo', Icon: PersonIcon, href: ROUTES.DASHBOARD_SETTINGS_PROFILE },
  {
    key: 'accountType',
    Icon: FeatureVerifiedIcon,
    href: ROUTES.DASHBOARD_SETTINGS_ACCOUNT_TYPE,
    technicianOnly: true,
  },
  {
    key: 'portfolio',
    Icon: DashboardProjectsIcon,
    href: ROUTES.DASHBOARD_SETTINGS_PORTFOLIO,
    technicianOnly: true,
  },
  {
    key: 'services',
    Icon: DashboardJobOffersIcon,
    href: ROUTES.DASHBOARD_SETTINGS_SERVICES,
    technicianOnly: true,
    disabled: true,
  },
  {
    key: 'subscriptions',
    Icon: TrustBadgeIcon,
    href: ROUTES.DASHBOARD_SETTINGS_SUBSCRIPTIONS,
    technicianOnly: true,
  },
  {
    key: 'cards',
    Icon: DashboardPaymentsIcon,
    href: ROUTES.DASHBOARD_SETTINGS_CARDS,
    disabled: true,
  },
  { key: 'transactions', Icon: SaudiRiyalIcon, href: ROUTES.DASHBOARD_PAYMENTS },
];

/** Help / extras rows, shown under the language + theme toggles. */
export const HELP_ROWS: readonly ProfileLinkRow[] = [
  { key: 'support', Icon: TrustSupportIcon, href: ROUTES.DASHBOARD_SETTINGS_SUPPORT },
  { key: 'referral', Icon: SendIcon, href: ROUTES.DASHBOARD_SETTINGS_REFERRAL },
  { key: 'feedback', Icon: MessageCircleIcon, href: ROUTES.CONTACT, disabled: true },
];

/** Danger-zone destructive navigation (logout is rendered separately as a button). */
export const DELETE_ROW: ProfileLinkRow = {
  key: 'delete',
  Icon: CloseIcon,
  href: ROUTES.DASHBOARD_SETTINGS_DELETE,
  tone: 'danger',
};

/** Role gate — customers (USER) hide technician-only rows. */
export function visibleRows(
  rows: readonly ProfileLinkRow[],
  isTechnician: boolean,
): ProfileLinkRow[] {
  return rows.filter((r) => isTechnician || !r.technicianOnly);
}
