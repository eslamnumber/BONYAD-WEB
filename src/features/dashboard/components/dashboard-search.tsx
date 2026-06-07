'use client';

import { useTranslation } from 'react-i18next';

import { DashboardSearchIcon } from '@/components/icons';

/**
 * Dashboard top search bar — a glass pill with the search prompt + trailing
 * magnifier. Presentational for now (no search endpoint in scope); the input is
 * a real free-text field so it can be wired to a query later.
 */
export function DashboardSearch() {
  const { t } = useTranslation();

  return (
    <div
      role="search"
      className="bg-dashboard-search-bg border-border mx-auto flex h-14 w-full max-w-[708px] items-center gap-4 rounded-full border px-4 py-2 backdrop-blur-[40px]"
    >
      <label htmlFor="dashboard-search" className="sr-only">
        {t('dashboard.search.label')}
      </label>
      <input
        id="dashboard-search"
        name="q"
        type="text"
        inputMode="search"
        placeholder={t('dashboard.search.placeholder')}
        // Bilingual free-text field. [direction:inherit] anchors text-end to the
        // document/locale side (right in ar, left in en) so the placeholder sits
        // by the trailing icon; [unicode-bidi:plaintext] resolves direction per the
        // content language so the trailing "؟"/"?" stays attached in BOTH locales
        // (docs/i18n-and-rtl.md §bidi). type="text" avoids the type=search UA
        // `direction: ltr` override (rule 5).
        className="text-foreground placeholder:text-input-placeholder min-w-0 flex-1 bg-transparent text-end text-base [direction:inherit] [unicode-bidi:plaintext] focus-visible:outline-none"
      />
      <DashboardSearchIcon className="text-foreground size-6 shrink-0" aria-hidden />
    </div>
  );
}
