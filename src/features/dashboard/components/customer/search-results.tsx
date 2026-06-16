'use client';

import { useTranslation } from 'react-i18next';

import type { ServiceMatch } from '../../lib/dashboard-search';

type SearchResultsProps = {
  results: ServiceMatch[];
  onSelect: (term: string) => void;
};

/**
 * Typed-query dropdown body (Figma state C 1431:16053) — service category /
 * subcategory matches with the matched run emphasised (`foreground`) and the rest
 * dimmed (`foreground/60`), right-aligned in `ar` / left in `en` via `items-end`.
 * Empty result set shows the localized "no matches" line.
 */
export function SearchResults({ results, onSelect }: SearchResultsProps) {
  const { t } = useTranslation();

  if (results.length === 0) {
    return (
      <p className="text-muted-foreground text-end text-xs">
        {t('dashboard.customer.search.noResults')}
      </p>
    );
  }

  return (
    <ul className="flex flex-col items-end gap-1">
      {results.map((match) => (
        <ResultItem key={match.service.id} match={match} onSelect={() => onSelect(match.name)} />
      ))}
    </ul>
  );
}

function ResultItem({ match, onSelect }: { match: ServiceMatch; onSelect: () => void }) {
  return (
    <li>
      <button
        type="button"
        dir="auto"
        onClick={onSelect}
        className="text-foreground hover:text-brand-dark-navy focus-visible:outline-ring rounded-xs text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {match.parts.map((part, index) => (
          <span key={`${part.text}-${index}`} className={part.match ? undefined : 'opacity-60'}>
            {part.text}
          </span>
        ))}
      </button>
    </li>
  );
}
