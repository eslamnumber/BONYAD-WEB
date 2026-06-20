'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { type ComponentType, type ReactNode, type SVGProps } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  DashboardPaymentsIcon,
  LockIcon,
  PersonIcon,
  PhoneIcon,
} from '@/components/icons';
import { ROUTES } from '@/config/routes';

import { ManageRow } from './manage-row';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
export type ManageKey = 'edit' | 'phone' | 'password';
/** The inline sub-screen rendered when a row is selected. Passed from the route page. */
export type ManageForms = Partial<Record<ManageKey, ReactNode>>;

const ROWS: { key: ManageKey; Icon: IconComponent }[] = [
  { key: 'edit', Icon: PersonIcon },
  { key: 'phone', Icon: PhoneIcon },
  { key: 'password', Icon: LockIcon },
];

/** Placeholder shown while a sub-screen's form isn't wired yet. */
function ComingSoon() {
  const { t } = useTranslation();
  return <p className="text-muted-foreground text-end text-sm">{t('common.comingSoon')}</p>;
}

/** Accordion trigger — its chevron rotates as the panel opens (honest expand affordance). */
function ManageButton({
  row,
  active,
  onClick,
}: {
  row: { key: ManageKey; Icon: IconComponent };
  active: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      aria-controls="manage-panel"
      className={`focus-visible:outline-ring block w-full transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 ${active ? 'bg-primary/5' : 'motion-safe:hover:bg-muted/60'}`}
    >
      <ManageRow
        Icon={row.Icon}
        title={t(`profile.myInfo.nav.${row.key}.title`)}
        subtitle={t(`profile.myInfo.nav.${row.key}.subtitle`)}
        chevron={
          <ChevronDownIcon
            className={`size-5 shrink-0 transition-transform ${active ? 'text-primary rotate-180' : 'text-muted-foreground/50'}`}
            aria-hidden
          />
        }
      />
    </button>
  );
}

/** The single animated panel below all the buttons — height animates on open/close/swap. */
function ManagePanel({ openKey, forms }: { openKey: ManageKey | null; forms: ManageForms }) {
  return (
    <AnimatePresence initial={false}>
      {openKey ? (
        <motion.div
          id="manage-panel"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="border-border bg-muted/20 border-t px-4 py-5 sm:px-5">
            {forms[openKey] ?? <ComingSoon />}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** "My transactions" — a real drill-in link (customers only), so it keeps a navigation chevron. */
function TransactionsRow() {
  const { t } = useTranslation();
  return (
    <Link
      href={ROUTES.DASHBOARD_PAYMENTS}
      className="focus-visible:outline-ring motion-safe:hover:bg-muted/60 block transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2"
    >
      <ManageRow
        Icon={DashboardPaymentsIcon}
        title={t('profile.myInfo.nav.transactions.title')}
        subtitle={t('profile.myInfo.nav.transactions.subtitle')}
        chevron={
          <ChevronLeftIcon
            className="text-muted-foreground/50 size-5 shrink-0 rtl:-scale-x-100"
            aria-hidden
          />
        }
      />
    </Link>
  );
}

/**
 * "Manage" card (Figma 1674:7963) — four account-action rows. Edit profile / Change
 * phone / Change password expand their form inline in **one panel below all the
 * buttons** (controlled by the parent so the identity card's chevron can open Edit
 * too); the panel animates its height on open/close/swap (framer-motion, reduced-
 * motion honored globally). "My transactions" stays a drill-in link (customers only).
 * Forms are supplied by the route page so `features/profile` never imports `features/auth`.
 */
export function ManageAccordion({
  open,
  onToggle,
  forms,
  showTransactions,
}: {
  open: ManageKey | null;
  onToggle: (key: ManageKey) => void;
  forms: ManageForms;
  showTransactions: boolean;
}) {
  return (
    <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
      <div className="divide-border divide-y">
        {ROWS.map((row) => (
          <ManageButton
            key={row.key}
            row={row}
            active={open === row.key}
            onClick={() => onToggle(row.key)}
          />
        ))}
      </div>

      <ManagePanel openKey={open} forms={forms} />

      {showTransactions ? (
        <div className="border-border border-t">
          <TransactionsRow />
        </div>
      ) : null}
    </div>
  );
}
