'use client';

import { useTranslation } from 'react-i18next';

import { ChevronDownIcon } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SegmentedTabs, type SegmentedOption } from '@/components/ui/segmented-tabs';
import { cn } from '@/lib/utils';

import { PLOT_SHAPES, type PlotShape, type SketchFormState } from '../../lib/sketch-form';
import { SketchCard } from '../sketch-card';

type Props = {
  form: SketchFormState;
  setField: <K extends keyof SketchFormState>(key: K, value: SketchFormState[K]) => void;
};

/** A labelled numeric field with a unit suffix at the inline-end. */
function NumberField({
  id,
  label,
  value,
  onChange,
  suffix,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-muted-foreground text-xs font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="pe-9"
        />
        <span
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs"
        >
          {suffix}
        </span>
      </div>
    </div>
  );
}

/** The four boundary setbacks (front / back / left / right), in metres. */
function SetbackFields({ form, setField }: Props) {
  const { t } = useTranslation();
  const m = t('sketch.form.plot.metres');
  return (
    <div className="flex flex-col gap-3">
      <p className="text-foreground text-sm font-medium">{t('sketch.form.plot.setbacks.title')}</p>
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          id="setback-front"
          label={t('sketch.form.plot.setbacks.front')}
          value={form.setbackFront}
          onChange={(n) => setField('setbackFront', n)}
          suffix={m}
        />
        <NumberField
          id="setback-back"
          label={t('sketch.form.plot.setbacks.back')}
          value={form.setbackBack}
          onChange={(n) => setField('setbackBack', n)}
          suffix={m}
        />
        <NumberField
          id="setback-left"
          label={t('sketch.form.plot.setbacks.left')}
          value={form.setbackLeft}
          onChange={(n) => setField('setbackLeft', n)}
          suffix={m}
        />
        <NumberField
          id="setback-right"
          label={t('sketch.form.plot.setbacks.right')}
          value={form.setbackRight}
          onChange={(n) => setField('setbackRight', n)}
          suffix={m}
        />
      </div>
    </div>
  );
}

/** The expanded plot inputs — shape, dimensions, and the four setbacks. */
function PlotFields({ form, setField }: Props) {
  const { t } = useTranslation();
  const m = t('sketch.form.plot.metres');
  const shapeOptions: SegmentedOption<PlotShape>[] = PLOT_SHAPES.map((value) => ({
    value,
    label: t(`sketch.form.plot.shapes.${value}`),
  }));

  return (
    <div className="flex flex-col gap-4">
      <SegmentedTabs
        options={shapeOptions}
        value={form.plotShape}
        onChange={(value) => setField('plotShape', value)}
        ariaLabel={t('sketch.form.plot.shape')}
      />
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          id="plot-width"
          label={t('sketch.form.plot.width')}
          value={form.plotWidth}
          onChange={(n) => setField('plotWidth', n)}
          suffix={m}
        />
        <NumberField
          id="plot-length"
          label={t('sketch.form.plot.length')}
          value={form.plotLength}
          onChange={(n) => setField('plotLength', n)}
          suffix={m}
        />
      </div>
      <SetbackFields form={form} setField={setField} />
    </div>
  );
}

/** Optional plot geometry — shape, dimensions, and setbacks. Collapsed by default. */
export function PlotCard({ form, setField }: Props) {
  const { t } = useTranslation();
  return (
    <SketchCard title={t('sketch.form.plot.title')} description={t('sketch.form.plot.optional')}>
      <button
        type="button"
        onClick={() => setField('plotEnabled', !form.plotEnabled)}
        aria-expanded={form.plotEnabled}
        className="border-border bg-field-surface text-foreground hover:bg-muted focus-visible:outline-ring flex min-h-11 items-center justify-between rounded-xl border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t('sketch.form.plot.enable')}
        <ChevronDownIcon
          className={cn('size-4 transition-transform', form.plotEnabled && 'rotate-180')}
          aria-hidden
        />
      </button>
      {form.plotEnabled ? <PlotFields form={form} setField={setField} /> : null}
    </SketchCard>
  );
}
