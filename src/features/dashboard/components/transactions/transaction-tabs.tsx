'use client';

import { useTranslation } from 'react-i18next';

export type TransactionTab = 'transactions' | 'refunds';

const TABS: TransactionTab[] = ['transactions', 'refunds'];

const TAB = 'flex-1 rounded-full px-3 py-2.5 text-sm whitespace-nowrap transition-colors sm:px-4';
const ACTIVE = `${TAB} bg-toggle-highlight text-foreground font-semibold`;
const INACTIVE = `${TAB} text-toggle-inactive font-medium motion-safe:hover:text-foreground`;

/**
 * Two-tab segmented control (Transactions / Refund requests), mirroring the iOS
 * picker. `flex-row-reverse` keeps "Transactions" at the reading-start edge so the
 * order mirrors with the locale. Controlled — the active tab lives in the parent.
 */
export function TransactionTabs({
  active,
  onChange,
}: {
  active: TransactionTab;
  onChange: (tab: TransactionTab) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="tablist"
      aria-label={t('dashboard.transactions.title')}
      className="bg-toggle-pill flex flex-row-reverse gap-1 rounded-full p-1"
    >
      {TABS.map((key) => {
        const selected = active === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(key)}
            className={selected ? ACTIVE : INACTIVE}
          >
            {t(`dashboard.transactions.tabs.${key}`)}
          </button>
        );
      })}
    </div>
  );
}
