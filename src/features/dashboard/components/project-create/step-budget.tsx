'use client';

import { type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';

import { type CreateProjectFormValues } from '../../schemas/create-project-form';

import { WizardAdornedField, WizardCheckbox } from './wizard-fields';

const K = 'dashboard.createProject.steps.budget';

/** Step 2 — timeline (weeks) + expected budget + "no budget" toggle (Figma 1394:8005). */
export function StepBudget({ form }: { form: UseFormReturn<CreateProjectFormValues> }) {
  const { t } = useTranslation();
  const { errors } = form.formState;
  const noBudget = form.watch('noBudget');

  return (
    <div className="flex w-full flex-col items-end gap-3">
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-[34px]">
        <WizardAdornedField
          id="cp-timeline"
          label={t(`${K}.timelineLabel`)}
          placeholder={t(`${K}.timelinePlaceholder`)}
          field={form.register('timelineWeeks')}
          adornment={t(`${K}.weeksUnit`)}
        />
        <WizardAdornedField
          id="cp-budget"
          label={t(`${K}.budgetLabel`)}
          placeholder={t(`${K}.budgetPlaceholder`)}
          field={form.register('budget')}
          error={errors.budget?.message}
          disabled={noBudget}
          adornment={<SaudiRiyalIcon aria-hidden className="h-[19px] w-[18px]" />}
        />
      </div>
      <WizardCheckbox
        id="cp-no-budget"
        label={t(`${K}.noBudget`)}
        checked={noBudget}
        onChange={(v) => form.setValue('noBudget', v, { shouldValidate: true })}
      />
    </div>
  );
}
