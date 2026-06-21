'use client';

import { useTranslation } from 'react-i18next';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { SketchCard } from '../sketch-card';

type Props = { value: string; onChange: (value: string) => void };

/** Free-text project description — the one required field. */
export function DescriptionCard({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <SketchCard
      title={t('sketch.form.description.title')}
      description={t('sketch.form.description.hint')}
    >
      <Label htmlFor="sketch-description" className="sr-only">
        {t('sketch.form.description.label')}
      </Label>
      <Textarea
        id="sketch-description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('sketch.form.description.placeholder')}
        rows={5}
        className="resize-none"
      />
    </SketchCard>
  );
}
