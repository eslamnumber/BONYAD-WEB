'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchRecentIcon, SearchSuggestedIcon } from '@/components/icons';
import type { Locale } from '@/types/locale';

import { localizedServiceName } from '../../lib/dashboard-search';
import type { Service } from '../../schemas/service';

type SearchSuggestionsProps = {
  locale: Locale;
  recent: string[];
  suggested: Service[];
  onSelect: (term: string) => void;
};

/**
 * Empty-query dropdown body (Figma state B 1431:15935) — a "Recently" group
 * (localStorage terms) above a "Suggested" group (top `/services` categories).
 * Each group is right-aligned in `ar` / left-aligned in `en` via logical
 * `items-end`; group headers are static labels (no `dir="auto"`), list rows are
 * dynamic content (`dir="auto"`).
 */
export function SearchSuggestions({ locale, recent, suggested, onSelect }: SearchSuggestionsProps) {
  const { t } = useTranslation();

  return (
    <>
      {recent.length > 0 && (
        <SuggestionGroup
          icon={<SearchRecentIcon className="size-4 shrink-0" aria-hidden />}
          label={t('dashboard.customer.search.recent')}
        >
          {recent.map((term) => (
            <SuggestionItem key={term} label={term} onSelect={() => onSelect(term)} />
          ))}
        </SuggestionGroup>
      )}

      {suggested.length > 0 && (
        <SuggestionGroup
          icon={<SearchSuggestedIcon className="size-4 shrink-0" aria-hidden />}
          label={t('dashboard.customer.search.suggested')}
        >
          {suggested.map((service) => {
            const name = localizedServiceName(service, locale);
            return <SuggestionItem key={service.id} label={name} onSelect={() => onSelect(name)} />;
          })}
        </SuggestionGroup>
      )}
    </>
  );
}

function SuggestionGroup({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col items-end gap-2">
      <div className="text-muted-foreground flex items-center gap-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <ul className="flex flex-col items-end gap-1">{children}</ul>
    </section>
  );
}

function SuggestionItem({ label, onSelect }: { label: string; onSelect: () => void }) {
  return (
    <li>
      <button
        type="button"
        dir="auto"
        onClick={onSelect}
        className="text-foreground hover:text-brand-dark-navy focus-visible:outline-ring rounded-xs text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {label}
      </button>
    </li>
  );
}
