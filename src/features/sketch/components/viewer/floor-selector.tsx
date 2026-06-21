'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

import type { SketchFloor } from '../../api/sketch-types';
import { pickText } from '../../lib/locale-text';

type Props = {
  floors: SketchFloor[];
  /** Index of the isolated storey, or `null` to show every floor stacked. */
  value: number | null;
  onChange: (value: number | null) => void;
};

/** One pill in the selector. */
function FloorChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'focus-visible:outline-ring inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
        active
          ? 'bg-create-option-purple border-create-option-purple text-white'
          : 'border-border bg-card text-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  );
}

/**
 * Toggle which storey the 3D dollhouse shows — "All floors" (stacked) or a single
 * isolated floor, so the user can see inside lower storeys. Hidden for a
 * single-floor design (nothing to switch between).
 */
export function FloorSelector({ floors, value, onChange }: Props) {
  const { t, i18n } = useTranslation();
  if (floors.length < 2) return null;

  const floorLabel = (floor: SketchFloor, i: number): string =>
    pickText(i18n.language, floor.name_en, floor.name_ar) ||
    t('sketch.viewer.floorShort', { number: floor.level ?? i + 1 });

  return (
    <div
      role="group"
      aria-label={t('sketch.viewer.floorSelector')}
      className="flex flex-wrap gap-2"
    >
      <FloorChip active={value === null} onClick={() => onChange(null)}>
        {t('sketch.viewer.allFloors')}
      </FloorChip>
      {floors.map((floor, i) => (
        <FloorChip key={floor.id ?? `floor-${i}`} active={value === i} onClick={() => onChange(i)}>
          {floorLabel(floor, i)}
        </FloorChip>
      ))}
    </div>
  );
}
