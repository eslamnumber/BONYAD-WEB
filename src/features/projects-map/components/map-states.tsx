'use client';

import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

const K = 'projectsMap';

/**
 * Full-screen state variants for the projects map: loading spinner, error
 * retry, or the idle legend bar at the bottom when no marker is selected.
 */
export function MapStates({
  variant,
  locale: _locale,
  count,
}: {
  variant: 'loading' | 'error' | 'legend';
  locale: Locale;
  count?: number;
}) {
  const { t } = useTranslation();

  if (variant === 'loading') {
    return (
      <div className="bg-muted flex min-h-0 w-full flex-1 items-center justify-center">
        <span className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (variant === 'error') {
    return (
      <div className="bg-muted flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-3 px-4">
        <p className="text-muted-foreground text-sm">{t(`${K}.error`)}</p>
      </div>
    );
  }

  // legend
  return (
    <div className="bg-card/95 mx-auto mb-6 flex max-w-sm items-center gap-4 rounded-2xl px-4 py-2.5 shadow-lg backdrop-blur-sm">
      <span className="text-foreground flex items-center gap-1.5 text-xs font-medium">
        <span className="bg-primary size-2.5 rounded-full" />
        {t(`${K}.legend`)}
      </span>
      {count === 0 && <span className="text-muted-foreground text-xs">{t(`${K}.empty`)}</span>}
    </div>
  );
}
