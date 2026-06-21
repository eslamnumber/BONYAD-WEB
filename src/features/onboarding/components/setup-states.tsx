'use client';

import { useTranslation } from 'react-i18next';

import { Skeleton } from '@/components/ui';

/** Loading placeholder for the plan / service list steps. */
export function SetupListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-[84px] w-full rounded-2xl" />
      ))}
    </div>
  );
}

/** List-load failure with a retry, styled like the surrounding cards. */
export function SetupError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="border-border bg-card flex flex-col items-center gap-3 rounded-2xl border p-6 text-center">
      <p role="alert" className="text-destructive text-sm">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="text-primary focus-visible:outline-ring rounded-full text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2"
      >
        {t('common.tryAgain')}
      </button>
    </div>
  );
}

/** Empty list — copy only, never a hardcoded fallback (rule 23). */
export function SetupEmpty({ message }: { message: string }) {
  return (
    <div className="border-border bg-field-surface text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
      {message}
    </div>
  );
}
