'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { type ComponentType, type ReactNode, type SVGProps, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ChevronDownIcon,
  DashboardPaymentsIcon,
  LockIcon,
  PersonIcon,
  PhoneIcon,
} from '@/components/icons';
import { ROUTES } from '@/config/routes';

import { ProfileLinkRow, ProfileRowShell } from './profile-section';

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

/** A selector button — highlights + rotates its chevron when its panel is showing. */
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
      <ProfileRowShell
        Icon={row.Icon}
        title={t(`profile.myInfo.nav.${row.key}.title`)}
        subtitle={t(`profile.myInfo.nav.${row.key}.subtitle`)}
        trailing={
          <ChevronDownIcon
            className={`size-4 shrink-0 transition-transform ${active ? 'text-primary rotate-180' : 'text-muted-foreground/60'}`}
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

/**
 * "Manage" section — the three account actions as a selector group, with the
 * selected sub-screen expanding in **one panel below all the buttons** (not under
 * the clicked row). The panel animates its height on open/close/swap (framer-motion;
 * reduced-motion honored globally). "My transactions" stays a link (customers only).
 * Forms are supplied by the route page so `features/profile` never imports `features/auth`.
 */
export function ManageAccordion({
  forms,
  showTransactions,
}: {
  forms: ManageForms;
  showTransactions: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<ManageKey | null>(null);
  return (
    <section>
      <h2 className="text-muted-foreground mb-2.5 px-1 text-end text-xs font-medium tracking-wide">
        {t('profile.myInfo.nav.section')}
      </h2>
      <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-sm">
        <div className="divide-border divide-y">
          {ROWS.map((row) => (
            <ManageButton
              key={row.key}
              row={row}
              active={open === row.key}
              onClick={() => setOpen((current) => (current === row.key ? null : row.key))}
            />
          ))}
        </div>

        <ManagePanel openKey={open} forms={forms} />

        {showTransactions ? (
          <div className="border-border border-t">
            <ProfileLinkRow
              href={ROUTES.DASHBOARD_PAYMENTS}
              Icon={DashboardPaymentsIcon}
              title={t('profile.myInfo.nav.transactions.title')}
              subtitle={t('profile.myInfo.nav.transactions.subtitle')}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
