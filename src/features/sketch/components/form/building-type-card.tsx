'use client';

import { useTranslation } from 'react-i18next';

import { SegmentedTabs, type SegmentedOption } from '@/components/ui/segmented-tabs';

import {
  ARCH_STYLES,
  BUILDING_TYPES,
  type ArchStyle,
  type BuildingType,
} from '../../lib/sketch-form';
import { SketchCard } from '../sketch-card';

type Props = {
  projectType: BuildingType;
  style: ArchStyle;
  onTypeChange: (value: BuildingType) => void;
  onStyleChange: (value: ArchStyle) => void;
};

/** Building-type + architectural-style pickers (two segmented rows in one card). */
export function BuildingTypeCard({ projectType, style, onTypeChange, onStyleChange }: Props) {
  const { t } = useTranslation();

  const typeOptions: SegmentedOption<BuildingType>[] = BUILDING_TYPES.map((value) => ({
    value,
    label: t(`sketch.form.buildingType.options.${value}`),
  }));
  const styleOptions: SegmentedOption<ArchStyle>[] = ARCH_STYLES.map((value) => ({
    value,
    label: t(`sketch.form.style.options.${value}`),
  }));

  return (
    <SketchCard title={t('sketch.form.buildingType.title')}>
      <SegmentedTabs
        options={typeOptions}
        value={projectType}
        onChange={onTypeChange}
        ariaLabel={t('sketch.form.buildingType.title')}
      />
      <div className="flex flex-col gap-3">
        <p className="text-foreground text-sm font-medium">{t('sketch.form.style.title')}</p>
        <SegmentedTabs
          options={styleOptions}
          value={style}
          onChange={onStyleChange}
          ariaLabel={t('sketch.form.style.title')}
        />
      </div>
    </SketchCard>
  );
}
