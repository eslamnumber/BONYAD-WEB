'use client';

import { useTranslation } from 'react-i18next';

import { DashboardSearchIcon, SearchClearIcon, SearchResultArrowIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { conventionalDirection, type Locale } from '@/types/locale';

import { useCustomerSearch } from '../../hooks/use-customer-search';
import type { ServiceMatch } from '../../lib/dashboard-search';
import type { Service } from '../../schemas/service';

import { SearchResults } from './search-results';
import { SearchSuggestions } from './search-suggestions';

const POPUP_ID = 'customer-search-popup';

/**
 * Customer dashboard search (Figma "Search System" 1431:15821). A glass pill that
 * morphs into a white dropdown panel on focus: empty query → Recently + Suggested
 * (state B); typed query → ranked category matches + an active query chip (state
 * C). Submitting routes to the results page (`?q=`). Used on the customer landing
 * only — the technician + projects screens keep the shared `DashboardSearch` pill.
 */
export function CustomerSearch() {
  // prettier-ignore
  const {
    locale, query, open, recent, suggested, results, hasQuery,
    containerRef, onQueryChange, onFocus, submit, clearQuery,
  } = useCustomerSearch();

  const showResults = open && hasQuery;
  const showSuggestions = open && !hasQuery && (recent.length > 0 || suggested.length > 0);
  const expanded = showResults || showSuggestions;

  return (
    <div
      ref={containerRef}
      role="search"
      className="relative z-20 mx-auto h-14 w-full max-w-[708px]"
    >
      <div
        className={cn(
          'border-border absolute inset-x-0 top-0 flex flex-col border backdrop-blur-[40px]',
          expanded
            ? 'bg-popover gap-4 rounded-xl p-4'
            : 'bg-dashboard-search-bg h-14 justify-center rounded-full px-4 py-2',
        )}
      >
        <SearchField
          value={query}
          locale={locale}
          expanded={expanded}
          hasQuery={hasQuery}
          onChange={onQueryChange}
          onFocus={onFocus}
          onSubmit={() => submit(query)}
          onClear={clearQuery}
        />
        {expanded && (
          <SearchDropdown
            showResults={showResults}
            results={results}
            locale={locale}
            recent={recent}
            suggested={suggested}
            onSelect={submit}
          />
        )}
      </div>
    </div>
  );
}

type SearchDropdownProps = {
  showResults: boolean;
  results: ServiceMatch[];
  locale: Locale;
  recent: string[];
  suggested: Service[];
  onSelect: (term: string) => void;
};

function SearchDropdown({
  showResults,
  results,
  locale,
  recent,
  suggested,
  onSelect,
}: SearchDropdownProps) {
  return (
    <div id={POPUP_ID} className="flex flex-col gap-4">
      <div role="separator" className="border-dashboard-search-divider w-full border-t" />
      {showResults ? (
        <SearchResults results={results} onSelect={onSelect} />
      ) : (
        <SearchSuggestions
          locale={locale}
          recent={recent}
          suggested={suggested}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}

type SearchFieldProps = {
  value: string;
  locale: Locale;
  expanded: boolean;
  hasQuery: boolean;
  onChange: (value: string) => void;
  onFocus: () => void;
  onSubmit: () => void;
  onClear: () => void;
};

function SearchField({ value, locale, expanded, hasQuery, ...handlers }: SearchFieldProps) {
  const { t } = useTranslation();
  const { onChange, onFocus, onSubmit, onClear } = handlers;
  return (
    <div className="flex items-center gap-4">
      {hasQuery && (
        <SearchChip
          onSubmit={onSubmit}
          onClear={onClear}
          submitLabel={t('dashboard.customer.search.submit')}
          clearLabel={t('dashboard.customer.search.clear')}
        />
      )}
      <label htmlFor="customer-search" className="sr-only">
        {t('dashboard.customer.search.label')}
      </label>
      {/* Single-language search field the user fills in their own UI language: its
          writing direction is the locale's natural script via conventionalDirection
          (ar→rtl, en→ltr) + text-start, so the Arabic placeholder's trailing "…" stays
          attached at its natural end instead of floating. [direction:inherit] resolved
          the field to ltr in ar and floated it. type="text" avoids the type=search UA
          `direction: ltr` override. See docs/i18n-and-rtl.md RTL rule 4. */}
      <input
        id="customer-search"
        name="q"
        type="text"
        dir={conventionalDirection(locale)}
        role="combobox"
        inputMode="search"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? POPUP_ID : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSubmit();
        }}
        placeholder={t('dashboard.customer.search.placeholder')}
        className="text-foreground placeholder:text-input-placeholder min-w-0 flex-1 bg-transparent text-start text-base focus-visible:outline-none"
      />
      <DashboardSearchIcon className="text-foreground size-6 shrink-0" aria-hidden />
    </div>
  );
}

type SearchChipProps = {
  onSubmit: () => void;
  onClear: () => void;
  submitLabel: string;
  clearLabel: string;
};

function SearchChip({ onSubmit, onClear, submitLabel, clearLabel }: SearchChipProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={onSubmit}
        aria-label={submitLabel}
        className="bg-brand-dark-navy text-on-media focus-visible:outline-ring flex size-[22px] items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:transition-opacity motion-safe:hover:opacity-90"
      >
        <SearchResultArrowIcon className="size-4 rtl:-scale-x-100" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onClear}
        aria-label={clearLabel}
        className="text-foreground focus-visible:outline-ring rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-70"
      >
        <SearchClearIcon className="size-[14px]" aria-hidden />
      </button>
    </div>
  );
}
