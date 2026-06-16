'use client';

import { useRouter } from 'next/navigation';
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';
import type { Locale } from '@/types/locale';

import { useAllServices } from '../api/get-all-services';
import { searchServices, suggestedServices } from '../lib/dashboard-search';
import { addRecentSearch, getRecentSearches } from '../lib/recent-searches';

const SUGGESTED_LIMIT = 5;

/** Close `active` when a pointer lands outside `ref` or Escape is pressed. */
function useDismiss(ref: RefObject<HTMLElement | null>, active: boolean, onDismiss: () => void) {
  useEffect(() => {
    if (!active) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onDismiss();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ref, active, onDismiss]);
}

/**
 * State + behaviour for the customer dashboard search (Figma "Search System").
 * Owns the query, the open/focus state, the localStorage-backed recent list, and
 * derives suggested categories + ranked results from the cached `/services`
 * catalogue. Keeps the presentational components (bar, suggestions, results) thin.
 */
export function useCustomerSearch() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const locale: Locale = i18n.language.startsWith('ar') ? 'ar' : 'en';

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: services = [] } = useAllServices();
  useDismiss(
    containerRef,
    open,
    useCallback(() => setOpen(false), []),
  );

  const suggested = useMemo(
    () => suggestedServices(services, locale, SUGGESTED_LIMIT),
    [services, locale],
  );
  const results = useMemo(() => searchServices(services, query, locale), [services, query, locale]);

  // Read recent searches (localStorage, client-only) on focus — not in an effect,
  // so the first render + hydration both start from [].
  const onFocus = useCallback(() => {
    setOpen(true);
    setRecent(getRecentSearches());
  }, []);
  // Execute a search: persist it, close, and route to the results page with `?q=`
  // (the same destination the marketing hero search uses).
  const submit = useCallback(
    (term: string) => {
      const q = term.trim();
      if (!q) return;
      addRecentSearch(q);
      setOpen(false);
      router.push(`${ROUTES.TECHNICIANS}?q=${encodeURIComponent(q)}`);
    },
    [router],
  );

  return {
    locale,
    query,
    open,
    recent,
    suggested,
    results,
    hasQuery: query.trim().length > 0,
    containerRef,
    onQueryChange: setQuery,
    onFocus,
    submit,
    clearQuery: useCallback(() => setQuery(''), []),
  };
}
