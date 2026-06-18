'use client';

import { useTranslation } from 'react-i18next';

/**
 * Title block for the cards screen: the title + a role-aware blurb (technicians
 * register a card to *receive payouts*; customers to *pay*). Start-aligned to fill
 * the dashboard width (no centred hero / side gaps), matching the ProfileScreen
 * header. The blurb is punctuated translated copy, so it carries `dir="auto"` +
 * `text-start`; the static title uses `text-end` (both land on the same physical
 * side under the inverted locale mapping — see docs/i18n-and-rtl.md).
 */
export function CardManagementHeader({ isTechnician }: { isTechnician: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="min-w-0">
      <h1 className="text-foreground text-end text-2xl font-semibold tracking-tight sm:text-3xl">
        {t('cards.title')}
      </h1>
      <p dir="auto" className="text-muted-foreground mt-1.5 max-w-xl text-start text-sm leading-6">
        {isTechnician ? t('cards.info.technician') : t('cards.info.user')}
      </p>
    </div>
  );
}
