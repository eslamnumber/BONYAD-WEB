'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Skeleton } from '@/components/ui';
import { LOCALE_DIRECTION, type Locale } from '@/types/locale';

import { buildTermsDocument, type TermsDocColors } from '../lib/terms-document-html';
import { localizedTermsContent, type TermsAndConditions } from '../schemas/terms.schema';

type Query = UseQueryResult<TermsAndConditions | null>;

const TOKEN_VARS: Record<keyof TermsDocColors, string> = {
  surface: '--card',
  text: '--foreground',
  muted: '--muted-foreground',
  border: '--border',
  link: '--primary',
  heading: '--foreground',
};

/**
 * Resolve the current theme's token colours to concrete values for the isolated
 * iframe (it can't read the app's CSS vars). Computed in render — safe because the
 * dialog only mounts client-side — keyed on the theme so it re-resolves on toggle.
 */
function useDocumentColors(): TermsDocColors | null {
  const { resolvedTheme } = useTheme();
  return useMemo<TermsDocColors | null>(() => {
    if (typeof document === 'undefined') return null;
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;opacity:0;pointer-events:none';
    // Tag the probe with the active theme so the memo legitimately depends on it.
    probe.dataset.theme = resolvedTheme ?? 'light';
    document.body.appendChild(probe);
    const read = (cssVar: string) => {
      probe.style.color = `var(${cssVar})`;
      return getComputedStyle(probe).color;
    };
    const entries = Object.entries(TOKEN_VARS) as [keyof TermsDocColors, string][];
    const colors = Object.fromEntries(entries.map(([k, v]) => [k, read(v)])) as TermsDocColors;
    probe.remove();
    return colors;
  }, [resolvedTheme]);
}

function DocumentSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <Skeleton className="h-3 w-24" />
      <div className="border-border bg-card flex h-[58vh] min-h-[300px] w-full flex-col gap-3 rounded-lg border p-5">
        <Skeleton className="h-5 w-1/2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className={i % 3 === 2 ? 'h-3 w-2/3' : 'h-3 w-full'} />
        ))}
      </div>
    </div>
  );
}

function StateMessage({ title, body }: { title: string; body: string }) {
  return (
    <div
      role="status"
      className="border-border bg-muted/40 flex min-h-[260px] flex-col items-center justify-center gap-2 rounded-lg border px-6 py-10 text-center"
    >
      <p className="text-foreground text-base font-medium">{title}</p>
      <p className="text-muted-foreground text-sm">
        <bdi>{body}</bdi>
      </p>
    </div>
  );
}

/**
 * Renders the active Terms document inside a fully-sandboxed iframe (no scripts, no
 * same-origin, no navigation), with the body in the reader's language and the
 * theme's token colours injected so it follows light/dark. Pending / error / empty /
 * loaded states are all rendered.
 */
function TermsErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <StateMessage title={t('auth.terms.errorTitle')} body={t('auth.terms.errorBody')} />
      <Button type="button" variant="outline" onClick={onRetry} className="self-center">
        {t('auth.terms.retry')}
      </Button>
    </div>
  );
}

export function TermsDocument({ query, locale }: { query: Query; locale: Locale }) {
  const { t } = useTranslation();
  const colors = useDocumentColors();
  const terms = query.data ?? null;
  const isArabic = LOCALE_DIRECTION[locale] === 'ltr';
  const body = terms ? localizedTermsContent(terms, locale) : '';

  const srcDoc = useMemo(() => {
    if (!body || !colors) return null;
    return buildTermsDocument({
      bodyHtml: body,
      dir: isArabic ? 'rtl' : 'ltr',
      lang: isArabic ? 'ar' : 'en',
      colors,
    });
  }, [body, colors, isArabic]);

  if (query.isPending) return <DocumentSkeleton />;
  if (query.isError) return <TermsErrorState onRetry={() => query.refetch()} />;
  if (!terms || !body) {
    return (
      <StateMessage title={t('auth.terms.unavailableTitle')} body={t('auth.terms.unavailable')} />
    );
  }
  if (!srcDoc) return <DocumentSkeleton />;

  return (
    <div className="flex flex-col gap-3">
      {terms.version ? (
        <p className="text-muted-foreground text-xs">
          {t('auth.terms.version', { version: terms.version })}
        </p>
      ) : null}
      <iframe
        title={t('auth.terms.documentTitle')}
        srcDoc={srcDoc}
        sandbox=""
        className="border-border bg-card h-[58vh] min-h-[300px] w-full rounded-lg border"
      />
    </div>
  );
}
