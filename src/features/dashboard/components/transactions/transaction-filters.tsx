'use client';

import { useTranslation } from 'react-i18next';

import {
  TRANSACTION_STATUS_FILTERS,
  type TransactionStatusFilter,
} from '../../schemas/transaction';

const PILL = 'shrink-0 rounded-full px-4 py-2.5 text-xs whitespace-nowrap transition-colors';
const ACTIVE = `${PILL} bg-toggle-highlight text-foreground font-semibold`;
const INACTIVE = `${PILL} text-toggle-inactive font-medium motion-safe:hover:text-foreground`;

/**
 * Status filter for the Transactions tab — a scroll-snap-free pill row (matches the
 * iOS horizontal filter row). `flex-row-reverse` puts "All" at the reading-start
 * edge so it mirrors with the locale. Controlled by the parent tab.
 */
export function TransactionFilters({
  value,
  onChange,
}: {
  value: TransactionStatusFilter;
  onChange: (value: TransactionStatusFilter) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="tablist"
      aria-label={t('dashboard.transactions.filtersLabel')}
      className="bg-toggle-pill flex [scrollbar-width:none] flex-row-reverse gap-1 overflow-x-auto rounded-full p-1 [&::-webkit-scrollbar]:hidden"
    >
      {TRANSACTION_STATUS_FILTERS.map((key) => {
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(key)}
            className={selected ? ACTIVE : INACTIVE}
          >
            {t(`dashboard.transactions.filters.${key.toLowerCase()}`)}
          </button>
        );
      })}
    </div>
  );
}
