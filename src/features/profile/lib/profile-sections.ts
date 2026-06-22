import {
  Briefcase,
  CreditCard,
  Gift,
  Headphones,
  MessageCircle,
  Star,
  Trash2,
  User,
  Wallet,
  Wrench,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

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
 * for now). `technicianOnly` rows are filtered out for customers. The Figma design
 * is drawn with Lucide outline icons (its nodes are named `user` / `credit-card` /
 * `headphones` / `gift` / `trash` …), so every row uses the matching `lucide-react`
 * glyph — rule 15 (lucide is allowed for system glyphs whose default form matches
 * the design). Rows the Figma doesn't show reuse on-theme Lucide icons for a
 * consistent outline set across the panel.
 */
export const ACCOUNT_ROWS: readonly ProfileLinkRow[] = [
  {
    key: 'accountType',
    Icon: User,
    href: ROUTES.DASHBOARD_SETTINGS_ACCOUNT_TYPE,
    technicianOnly: true,
  },
  {
    key: 'portfolio',
    Icon: Briefcase,
    href: ROUTES.DASHBOARD_SETTINGS_PORTFOLIO,
    technicianOnly: true,
  },
  {
    key: 'services',
    Icon: Wrench,
    href: ROUTES.DASHBOARD_SETTINGS_SERVICES,
    technicianOnly: true,
  },
  {
    key: 'subscriptions',
    Icon: Star,
    href: ROUTES.DASHBOARD_SETTINGS_SUBSCRIPTIONS,
    technicianOnly: true,
  },
  { key: 'cards', Icon: Wallet, href: ROUTES.DASHBOARD_SETTINGS_CARDS },
  { key: 'transactions', Icon: CreditCard, href: ROUTES.DASHBOARD_PAYMENTS },
];

/** Help / extras rows, shown under the language + theme toggles. */
export const HELP_ROWS: readonly ProfileLinkRow[] = [
  { key: 'support', Icon: Headphones, href: ROUTES.DASHBOARD_SETTINGS_SUPPORT },
  { key: 'referral', Icon: Gift, href: ROUTES.DASHBOARD_SETTINGS_REFERRAL },
  { key: 'feedback', Icon: MessageCircle, href: ROUTES.DASHBOARD_SETTINGS_FEEDBACK },
];

/** Danger-zone destructive navigation (logout is rendered separately as a button). */
export const DELETE_ROW: ProfileLinkRow = {
  key: 'delete',
  Icon: Trash2,
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
