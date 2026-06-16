'use client';

import { type ChangeEvent } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FieldHint, Input } from '@/components/ui';
import { Label } from '@/components/ui/label';

import { type OwnerEditFormValues } from '../../schemas/owner-edit';

import { filters } from './field';

/**
 * Budget field with an "Unspecified" toggle (RN OwnerProjectEditScreen). When the
 * owner marks the budget unspecified the input is disabled and the mapper sends
 * no `budget` to the backend (→ null).
 */
export function BudgetField({ form }: { form: UseFormReturn<OwnerEditFormValues> }) {
  const { t } = useTranslation();
  const unspecified = form.watch('budgetUnspecified');
  const error = form.formState.errors.budget?.message;
  const budget = form.register('budget');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.value = filters.decimal(e.target.value);
    budget.onChange(e);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <label className="text-foreground/70 flex cursor-pointer items-center gap-2 text-[13px]">
          <input
            type="checkbox"
            className="accent-brand-dark-navy size-4"
            {...form.register('budgetUnspecified')}
          />
          {t('dashboard.projectEdit.fields.budgetUnspecified')}
        </label>
        <Label
          htmlFor="project-budget"
          className="text-foreground text-end text-[13px] font-medium"
        >
          {t('dashboard.projectEdit.fields.budgetLabel')}
        </Label>
      </div>
      <Input
        id="project-budget"
        inputMode="decimal"
        disabled={unspecified}
        className="bg-field-surface border-border placeholder:text-foreground/60 h-11 rounded-lg border text-end text-sm disabled:opacity-50"
        {...budget}
        onChange={onChange}
      />
      <FieldHint tone="error">{error ? t(error) : undefined}</FieldHint>
    </div>
  );
}
