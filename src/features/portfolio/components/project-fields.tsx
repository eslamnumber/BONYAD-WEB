'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { todayIso } from '../lib/project-display';
import { type ProjectFormValues } from '../schemas/portfolio-form';

import { TextAreaField, TextField, VisibilityToggle } from './portfolio-fields';

type Form = UseFormReturn<ProjectFormValues>;

/**
 * Start + end date pickers. Both are capped at today (no future dates); the end date's
 * lower bound tracks the chosen start, and each carries its own validation error.
 */
function DatesRow({ form }: { form: Form }) {
  const { t } = useTranslation();
  const today = todayIso();
  const start = form.watch('startDate');
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <TextField
        id="pj-start"
        type="date"
        max={today}
        label={t('portfolio.project.fields.startDate')}
        register={form.register('startDate')}
        error={form.formState.errors.startDate?.message}
      />
      <TextField
        id="pj-end"
        type="date"
        min={start || undefined}
        max={today}
        label={t('portfolio.project.fields.endDate')}
        register={form.register('endDate')}
        error={form.formState.errors.endDate?.message}
      />
    </div>
  );
}

/** Client name + project value (value must be a positive number). */
function ClientValueRow({ form }: { form: Form }) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <TextField
        id="pj-client"
        label={t('portfolio.project.fields.clientName')}
        register={form.register('clientName')}
        error={form.formState.errors.clientName?.message}
      />
      <TextField
        id="pj-value"
        type="number"
        inputMode="decimal"
        min="0"
        label={t('portfolio.project.fields.projectValue')}
        register={form.register('projectValue')}
        error={form.formState.errors.projectValue?.message}
      />
    </div>
  );
}

/** Past-project form fields (shared by add + edit). My own web design. */
export function ProjectFields({ form }: { form: Form }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-5">
      <TextField
        id="pj-title"
        label={t('portfolio.project.fields.title')}
        placeholder={t('portfolio.project.fields.titlePlaceholder')}
        register={form.register('title')}
        error={form.formState.errors.title?.message}
      />
      <TextAreaField
        id="pj-desc"
        label={t('portfolio.project.fields.description')}
        placeholder={t('portfolio.project.fields.descriptionPlaceholder')}
        register={form.register('description')}
        error={form.formState.errors.description?.message}
      />
      <DatesRow form={form} />
      <ClientValueRow form={form} />
      <TextField
        id="pj-location"
        label={t('portfolio.project.fields.location')}
        register={form.register('location')}
        error={form.formState.errors.location?.message}
      />
      <Controller
        control={form.control}
        name="isPublic"
        render={({ field }) => (
          <VisibilityToggle
            checked={field.value}
            onChange={field.onChange}
            label={t('portfolio.project.fields.visibility')}
            hint={t('portfolio.project.fields.visibilityHint')}
          />
        )}
      />
    </div>
  );
}
