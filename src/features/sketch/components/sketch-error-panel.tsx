'use client';

import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

import type { SketchErrorKind } from '../hooks/use-sketch-planner';

type Props = { kind: SketchErrorKind; onRetry: () => void };

/** Shared failure screen (generation / timeout / confirm) with a start-over action. */
export function SketchErrorPanel({ kind, onRetry }: Props) {
  const { t } = useTranslation();
  const message = kind === 'timeout' ? t('sketch.error.timeout') : t('sketch.error.generic');

  return (
    <div className="border-border flex w-full flex-col items-center gap-4 rounded-2xl border border-dashed py-14 text-center">
      <span
        aria-hidden
        className="bg-status-rejected-soft text-status-rejected flex size-14 items-center justify-center rounded-full"
      >
        <AlertTriangle className="size-7" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-foreground text-xl font-semibold">{t('sketch.error.title')}</h2>
        <p className="text-muted-foreground max-w-md text-sm">{message}</p>
      </div>
      <Button onClick={onRetry}>{t('sketch.error.startOver')}</Button>
    </div>
  );
}
