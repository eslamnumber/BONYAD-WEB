'use client';

import { useId } from 'react';
import { type Control, Controller, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Input, Select, Textarea } from '@/components/ui';

import {
  SUPPORT_CATEGORIES,
  SUPPORT_PRIORITIES,
  type SupportRequestFormValues,
} from '../schemas/support';

import { SupportField } from './support-field';

/** Subject + details — `text-start`, following the screen's conventional direction (no
 *  `dir="auto"`, so empty fields don't default to LTR; right-aligned in ar, left in en). */
function RequestTextFields({ form }: { form: UseFormReturn<SupportRequestFormValues> }) {
  const { t } = useTranslation();
  const subjectId = useId();
  const descId = useId();
  const {
    register,
    formState: { errors },
  } = form;
  return (
    <>
      <SupportField
        label={t('support.new.subjectLabel')}
        htmlFor={subjectId}
        error={errors.subject?.message}
      >
        <Input
          id={subjectId}
          className="text-start"
          placeholder={t('support.new.subjectPlaceholder')}
          {...register('subject')}
        />
      </SupportField>
      <SupportField
        label={t('support.new.descriptionLabel')}
        htmlFor={descId}
        error={errors.description?.message}
      >
        <Textarea
          id={descId}
          rows={4}
          className="text-start"
          placeholder={t('support.new.descriptionPlaceholder')}
          {...register('description')}
        />
      </SupportField>
    </>
  );
}

/** A {@link SupportField}-wrapped {@link Select} bound to a form control. */
function ControlledSelect({
  control,
  name,
  values,
  prefix,
  error,
}: {
  control: Control<SupportRequestFormValues>;
  name: 'category' | 'priority';
  values: readonly string[];
  prefix: string;
  error?: string;
}) {
  const { t } = useTranslation();
  const id = useId();
  const options = values.map((v) => ({
    value: v,
    label: t(`support.${prefix}.${v.toLowerCase()}`),
  }));
  return (
    <SupportField label={t(`support.new.${name}Label`)} htmlFor={id} error={error}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            id={id}
            value={field.value}
            onChange={field.onChange}
            options={options}
            placeholder={t(`support.new.${name}Placeholder`)}
          />
        )}
      />
    </SupportField>
  );
}

export function RequestFormFields({ form }: { form: UseFormReturn<SupportRequestFormValues> }) {
  const {
    control,
    formState: { errors },
  } = form;
  return (
    <>
      <RequestTextFields form={form} />
      <ControlledSelect
        control={control}
        name="category"
        values={SUPPORT_CATEGORIES}
        prefix="categories"
        error={errors.category?.message}
      />
      <ControlledSelect
        control={control}
        name="priority"
        values={SUPPORT_PRIORITIES}
        prefix="priorities"
        error={errors.priority?.message}
      />
    </>
  );
}
