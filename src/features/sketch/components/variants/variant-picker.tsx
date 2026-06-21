'use client';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

import type { SketchJob, SketchParse } from '../../api/sketch-types';

import { VariantCard } from './variant-card';

type Props = {
  job: SketchJob;
  selectedIndex: number | null;
  confirming: boolean;
  onSelect: (index: number) => void;
  onConfirm: () => void;
  onCompliance: (parse: SketchParse | undefined) => void;
};

/** Phase 3 — browse the 2D floor-plan variants and pick one to build in 3D. */
export function VariantPicker({
  job,
  selectedIndex,
  confirming,
  onSelect,
  onConfirm,
  onCompliance,
}: Props) {
  const { t } = useTranslation();
  const variants = job.variant_floor_svgs ?? [];

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-foreground text-2xl font-semibold">{t('sketch.variants.title')}</h2>
        <p className="text-muted-foreground text-base">{t('sketch.variants.subtitle')}</p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {variants.map((floors, i) => (
          <li key={`variant-${i}`}>
            <VariantCard
              label={job.variant_labels?.[i]}
              parse={job.variant_parses?.[i]}
              floors={floors}
              selected={selectedIndex === i}
              onSelect={() => onSelect(i)}
              onCompliance={() => onCompliance(job.variant_parses?.[i])}
            />
          </li>
        ))}
      </ul>

      <div className="border-border bg-background/90 sticky bottom-0 flex justify-end border-t py-4 backdrop-blur">
        <Button
          size="lg"
          onClick={onConfirm}
          disabled={selectedIndex === null || confirming}
          className="w-full sm:w-auto"
        >
          {confirming ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              {t('sketch.variants.confirming')}
            </>
          ) : (
            t('sketch.variants.confirm')
          )}
        </Button>
      </div>
    </div>
  );
}
