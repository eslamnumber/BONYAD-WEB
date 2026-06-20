'use client';

import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';

import type { FlowErrorKind } from './sow-flow-types';

const K = 'dashboard.createProject.ai.sow.error';

const ICONS: Record<FlowErrorKind, typeof WifiOff> = {
  offline: WifiOff,
  generation: AlertTriangle,
  'publish-service': AlertTriangle,
  'publish-failed': AlertTriangle,
};

/**
 * Error / offline faces — health-check offline, generation failure, unresolved
 * service match, and publish failure. The retry label/behaviour is per-kind
 * (service-match sends the user back to refine the scope).
 */
export function SowError({
  kind,
  onRetry,
  onExit,
}: {
  kind: FlowErrorKind;
  onRetry: () => void;
  onExit: () => void;
}) {
  const { t } = useTranslation();
  const Icon = ICONS[kind];

  return (
    <div className="flex w-full max-w-[440px] flex-col items-center gap-6 text-center">
      <span className="bg-destructive/10 text-destructive flex size-16 items-center justify-center rounded-full">
        <Icon className="size-7" aria-hidden />
      </span>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-foreground text-xl font-semibold">{t(`${K}.${kind}.title`)}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">{t(`${K}.${kind}.message`)}</p>
      </div>
      <div className="flex w-full flex-col gap-3">
        <Button onClick={onRetry} className="h-12 rounded-full text-base font-semibold">
          <RefreshCw className="size-4" aria-hidden />
          {t(`${K}.${kind}.retry`)}
        </Button>
        <Button variant="ghost" onClick={onExit} className="h-11 rounded-full">
          {t(`${K}.exit`)}
        </Button>
      </div>
    </div>
  );
}
