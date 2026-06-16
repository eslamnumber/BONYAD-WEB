'use client';

import { type UseFormReturn, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';

import { type EditablePhase, type OwnerEditFormValues } from '../../schemas/owner-edit';

import { PhaseRow } from './phase-row';

const NEW_PHASE: EditablePhase = {
  id: null,
  phaseNumber: '',
  description: '',
  durationWeeks: '',
  amount: '',
};

/**
 * Dynamic project-phases editor (RN OwnerProjectEditScreen). `keyName: 'fieldKey'`
 * keeps React Hook Form's generated key off our own `id` field (which carries the
 * backend phase id used by the save payload).
 */
export function PhasesEditor({ form }: { form: UseFormReturn<OwnerEditFormValues> }) {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'phases',
    keyName: 'fieldKey',
  });

  return (
    <section className="flex w-full flex-col gap-4">
      <div className="flex w-full items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => append(NEW_PHASE)}
          className="border-border text-foreground h-9 rounded-lg text-[13px] font-medium"
        >
          {t('dashboard.projectEdit.phases.add')}
        </Button>
        <h3 className="text-foreground text-end text-base font-semibold">
          {t('dashboard.projectEdit.phases.heading')}
        </h3>
      </div>
      {fields.length === 0 ? (
        <p className="text-foreground/60 text-end text-sm">
          {t('dashboard.projectEdit.phases.empty')}
        </p>
      ) : (
        <ul className="flex w-full flex-col gap-4">
          {fields.map((field, index) => (
            <PhaseRow
              key={field.fieldKey}
              index={index}
              form={form}
              onRemove={() => remove(index)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
