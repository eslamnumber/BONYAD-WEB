'use client';

import { type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui';

import { type OwnerEditFormValues } from '../../schemas/owner-edit';

import { EditField, EditTextArea, filters } from './field';

type Props = {
  index: number;
  form: UseFormReturn<OwnerEditFormValues>;
  onRemove: () => void;
};

/** One editable phase row: description + (duration, cost) + remove control. */
export function PhaseRow({ index, form, onRemove }: Props) {
  const { t } = useTranslation();
  const errors = form.formState.errors.phases?.[index];

  return (
    <li className="border-border flex w-full flex-col gap-4 rounded-lg border p-4">
      <div className="flex w-full items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onRemove}
          className="text-destructive h-auto p-0 text-[13px] font-medium hover:bg-transparent"
        >
          {t('dashboard.projectEdit.phases.remove')}
        </Button>
        <span className="text-foreground text-end text-sm font-semibold">
          {t('dashboard.projectEdit.phases.phaseLabel', { number: index + 1 })}
        </span>
      </div>
      <EditTextArea
        id={`phase-${index}-description`}
        label={t('dashboard.projectEdit.phases.descriptionLabel')}
        placeholder={t('dashboard.projectEdit.phases.descriptionPlaceholder')}
        field={form.register(`phases.${index}.description`)}
        error={errors?.description?.message}
      />
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <EditField
          id={`phase-${index}-duration`}
          label={t('dashboard.projectEdit.phases.durationLabel')}
          inputMode="numeric"
          filter={filters.digits}
          field={form.register(`phases.${index}.durationWeeks`)}
        />
        <EditField
          id={`phase-${index}-amount`}
          label={t('dashboard.projectEdit.phases.costLabel')}
          inputMode="decimal"
          filter={filters.decimal}
          field={form.register(`phases.${index}.amount`)}
        />
      </div>
    </li>
  );
}
