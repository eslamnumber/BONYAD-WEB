'use client';

import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { PlusIcon } from '@/components/icons';

import { type CreateProjectFormValues } from '../../schemas/create-project-form';
import { emptyPhaseInput } from '../../schemas/phase-input';

import { PhaseCard } from './phase-card';

const K = 'dashboard.createProject.steps.phases';

/** Step 4 — optional phase list with add / remove (Figma 1394:7285). */
export function StepPhases({ form }: { form: UseFormReturn<CreateProjectFormValues> }) {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'phases' });

  return (
    <div className="flex w-full flex-col items-end gap-3">
      {fields.map((f, i) => (
        <PhaseCard
          key={f.id}
          form={form}
          index={i}
          onRemove={fields.length > 1 ? () => remove(i) : undefined}
        />
      ))}
      <button
        type="button"
        onClick={() => append(emptyPhaseInput())}
        className="border-brand-dark-navy text-brand-dark-navy bg-background flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium"
      >
        <PlusIcon aria-hidden className="size-4" />
        {t(`${K}.addPhase`)}
      </button>
    </div>
  );
}
