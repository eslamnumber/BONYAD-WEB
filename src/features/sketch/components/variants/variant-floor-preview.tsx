'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PhaseCheckIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

import type { SketchFloorSvg } from '../../api/sketch-types';
import { pickText } from '../../lib/locale-text';

import { SvgFloorFrame } from './svg-floor-frame';

type Props = {
  floors: SketchFloorSvg[];
  name: string;
  selected: boolean;
  onSelect: () => void;
};

/** Tab row to switch a variant's floor plans — only shown when it has >1 storey. */
function FloorSwitcher({
  floors,
  index,
  onPick,
}: {
  floors: SketchFloorSvg[];
  index: number;
  onPick: (i: number) => void;
}) {
  const { t, i18n } = useTranslation();
  return (
    <div
      role="group"
      aria-label={t('sketch.variants.floorSwitcher')}
      className="border-border flex flex-wrap gap-2 border-t px-3 py-2"
    >
      {floors.map((floor, i) => {
        const named = pickText(i18n.language, floor.name_en, floor.name_ar);
        const text = named || t('sketch.variants.floorShort', { number: floor.level ?? i + 1 });
        return (
          <button
            key={floor.id ?? `floor-${i}`}
            type="button"
            onClick={() => onPick(i)}
            aria-pressed={i === index}
            className={cn(
              'inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition-colors',
              i === index
                ? 'bg-create-option-purple text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}

/**
 * A variant's floor-plan preview. The backend returns one SVG per storey, so this
 * shows ALL of them via a switcher (was previously stuck on floor 0), and selects
 * the variant when the plan is tapped — the iframe inside is `pointer-events-none`
 * so the tap reaches this button.
 */
export function VariantFloorPreview({ floors, name, selected, onSelect }: Props) {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const index = Math.min(active, Math.max(floors.length - 1, 0));
  const svg = floors[index]?.svg;

  return (
    <>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${t('sketch.variants.select')} — ${name}`}
        className="focus-visible:outline-ring relative flex aspect-square w-full items-center justify-center overflow-hidden bg-white -outline-offset-2 focus-visible:outline-2"
      >
        {svg ? <SvgFloorFrame svg={svg} title={name} /> : null}
        {selected ? (
          <span className="bg-create-option-purple absolute end-2 top-2 flex size-7 items-center justify-center rounded-full text-white">
            <PhaseCheckIcon className="size-4" aria-hidden />
          </span>
        ) : null}
      </button>
      {floors.length > 1 ? (
        <FloorSwitcher floors={floors} index={index} onPick={setActive} />
      ) : null}
    </>
  );
}
