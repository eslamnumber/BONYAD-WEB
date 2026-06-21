'use client';

import { useTranslation } from 'react-i18next';

import { Slider } from '@/components/ui/slider';
import { Stepper } from '@/components/ui/stepper';

import { AREA_MAX, AREA_MIN, AREA_STEP } from '../../lib/sketch-form';
import { SketchCard } from '../sketch-card';

type Props = {
  area: number;
  bedrooms: number;
  bathrooms: number;
  onAreaChange: (value: number) => void;
  onBedroomsChange: (value: number) => void;
  onBathroomsChange: (value: number) => void;
};

/** A labelled counter tile (bedrooms / bathrooms). */
function RoomRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="border-border bg-field-surface flex items-center justify-between gap-3 rounded-xl border p-3">
      <span className="text-foreground text-sm font-medium">{label}</span>
      <Stepper
        label={label}
        value={value}
        onChange={onChange}
        min={0}
        max={20}
        decrementLabel={`${t('sketch.form.areaRooms.decrease')} ${label}`}
        incrementLabel={`${t('sketch.form.areaRooms.increase')} ${label}`}
      />
    </div>
  );
}

/** Total-area slider + bedroom / bathroom counters. */
export function AreaRoomsCard({
  area,
  bedrooms,
  bathrooms,
  onAreaChange,
  onBedroomsChange,
  onBathroomsChange,
}: Props) {
  const { t } = useTranslation();
  const areaText = `${area} ${t('sketch.form.areaRooms.areaUnit')}`;

  return (
    <SketchCard title={t('sketch.form.areaRooms.title')}>
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-foreground text-sm font-medium">
            {t('sketch.form.areaRooms.area')}
          </span>
          <span className="text-create-option-purple text-base font-semibold tabular-nums">
            {areaText}
          </span>
        </div>
        <Slider
          value={area}
          onChange={onAreaChange}
          min={AREA_MIN}
          max={AREA_MAX}
          step={AREA_STEP}
          ariaLabel={t('sketch.form.areaRooms.area')}
          valueText={areaText}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RoomRow
          label={t('sketch.form.areaRooms.bedrooms')}
          value={bedrooms}
          onChange={onBedroomsChange}
        />
        <RoomRow
          label={t('sketch.form.areaRooms.bathrooms')}
          value={bathrooms}
          onChange={onBathroomsChange}
        />
      </div>
    </SketchCard>
  );
}
