'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FileIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import type { SketchJob } from '../../api/sketch-types';

import { FloorSelector } from './floor-selector';

const SketchScene = dynamic(() => import('./sketch-scene'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

type Props = {
  job: SketchJob;
  onViewCompliance: () => void;
  onStartOver: () => void;
};

/** Phase 4 — the WebGL dollhouse (client-only) plus its chrome. */
export function Sketch3DViewer({ job, onViewCompliance, onStartOver }: Props) {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const { parse, scene } = job;
  const [visibleFloor, setVisibleFloor] = useState<number | null>(null);

  return (
    <div className="flex w-full flex-col gap-5">
      <header className="flex flex-col gap-2">
        <h2 className="text-foreground text-2xl font-semibold">{t('sketch.viewer.title')}</h2>
        <p className="text-muted-foreground text-base">{t('sketch.viewer.subtitle')}</p>
      </header>

      {parse && scene ? (
        <div className="flex flex-col gap-3">
          <FloorSelector
            floors={parse.floors ?? []}
            value={visibleFloor}
            onChange={setVisibleFloor}
          />
          <div
            role="img"
            aria-label={t('sketch.viewer.canvasLabel')}
            className="border-border bg-muted relative h-[60vh] min-h-[420px] w-full overflow-hidden rounded-2xl border"
          >
            <SketchScene
              parse={parse}
              scene={scene}
              isDark={resolvedTheme === 'dark'}
              visibleFloor={visibleFloor}
            />
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground border-border rounded-2xl border border-dashed p-8 text-center">
          {t('sketch.viewer.unavailable')}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onViewCompliance}>
          <FileIcon className="size-4" aria-hidden />
          {t('sketch.viewer.viewCompliance')}
        </Button>
        <Button variant="ghost" onClick={onStartOver}>
          {t('sketch.viewer.startOver')}
        </Button>
      </div>
    </div>
  );
}
