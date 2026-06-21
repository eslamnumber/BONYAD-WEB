'use client';

import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AiAssistantIcon, SmartDesignIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';

import type { SketchIdeaArgs } from '../../api/submit-idea';
import { useSketchForm } from '../../hooks/use-sketch-form';
import { buildIdeaPayload } from '../../lib/sketch-form';

import { AreaRoomsCard } from './area-rooms-card';
import { BuildingTypeCard } from './building-type-card';
import { DescriptionCard } from './description-card';
import { PlotCard } from './plot-card';

type Props = {
  onGenerate: (payload: SketchIdeaArgs) => void;
  submitting?: boolean;
};

/** Hero — badge, title, subtitle (no `dir="auto"`: static labels, no weak punctuation). */
function SketchHero() {
  const { t } = useTranslation();
  return (
    <header className="flex flex-col items-start gap-3">
      <span className="bg-create-option-purple/10 text-create-option-purple inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
        <AiAssistantIcon className="size-3.5" aria-hidden />
        {t('sketch.hero.badge')}
      </span>
      <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
        {t('sketch.hero.title')}
      </h1>
      <p className="text-muted-foreground max-w-2xl text-base">{t('sketch.hero.subtitle')}</p>
    </header>
  );
}

function GenerateButton({
  disabled,
  submitting,
  onClick,
}: {
  disabled: boolean;
  submitting: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Button
      type="button"
      size="lg"
      onClick={onClick}
      disabled={disabled}
      className="w-full sm:w-auto sm:self-end"
    >
      {submitting ? (
        <>
          <Loader2 className="animate-spin" aria-hidden />
          {t('sketch.form.generatingCta')}
        </>
      ) : (
        <>
          <SmartDesignIcon className="size-5" aria-hidden />
          {t('sketch.form.generate')}
        </>
      )}
    </Button>
  );
}

/** Phase 1 — the input form. Collects the brief, then hands a strict payload up. */
export function SketchForm({ onGenerate, submitting = false }: Props) {
  const { t } = useTranslation();
  const { form, setField, isValid } = useSketchForm();

  const handleSubmit = () => {
    if (!isValid || submitting) return;
    const roomsClause = t('sketch.form.areaRooms.roomsClause', {
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
    });
    onGenerate(buildIdeaPayload(form, roomsClause));
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <SketchHero />
      <div className="flex w-full flex-col gap-5">
        <DescriptionCard value={form.description} onChange={(v) => setField('description', v)} />
        <BuildingTypeCard
          projectType={form.projectType}
          style={form.style}
          onTypeChange={(v) => setField('projectType', v)}
          onStyleChange={(v) => setField('style', v)}
        />
        <AreaRoomsCard
          area={form.area}
          bedrooms={form.bedrooms}
          bathrooms={form.bathrooms}
          onAreaChange={(v) => setField('area', v)}
          onBedroomsChange={(v) => setField('bedrooms', v)}
          onBathroomsChange={(v) => setField('bathrooms', v)}
        />
        <PlotCard form={form} setField={setField} />
      </div>
      <GenerateButton
        disabled={!isValid || submitting}
        submitting={submitting}
        onClick={handleSubmit}
      />
    </div>
  );
}
