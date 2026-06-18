'use client';

import { useId } from 'react';
import { type Control, Controller, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Input, Select, Textarea } from '@/components/ui';
import { type Locale } from '@/types/locale';

import { useSupportCategories } from '../api';
import { categoryName } from '../lib/ticket-format';
import { TICKET_PRIORITIES, type TicketFormValues } from '../schemas/ticket';

import { SupportField } from './support-field';

type Form = UseFormReturn<TicketFormValues>;

/** Subject + details — `text-start`, following the screen's conventional direction (no
 *  `dir="auto"`, so empty fields don't default to LTR; right-aligned in ar, left in en). */
function TicketTextFields({ form }: { form: Form }) {
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
        label={t('support.ticket.subjectLabel')}
        htmlFor={subjectId}
        error={errors.subject?.message}
      >
        <Input
          id={subjectId}
          className="text-start"
          placeholder={t('support.ticket.subjectPlaceholder')}
          {...register('subject')}
        />
      </SupportField>
      <SupportField
        label={t('support.ticket.descriptionLabel')}
        htmlFor={descId}
        error={errors.description?.message}
      >
        <Textarea
          id={descId}
          rows={4}
          className="text-start"
          placeholder={t('support.ticket.descriptionPlaceholder')}
          {...register('description')}
        />
      </SupportField>
    </>
  );
}

function PrioritySelect({ control }: { control: Control<TicketFormValues> }) {
  const { t } = useTranslation();
  const options = TICKET_PRIORITIES.map((p) => ({
    value: p,
    label: t(`support.priorities.${p.toLowerCase()}`),
  }));
  return (
    <SupportField label={t('support.ticket.priorityLabel')}>
      <Controller
        control={control}
        name="priority"
        render={({ field }) => (
          <Select
            value={field.value}
            onChange={field.onChange}
            options={options}
            placeholder={t('support.ticket.priorityPlaceholder')}
          />
        )}
      />
    </SupportField>
  );
}

/** Category + (dependent) subcategory pickers — hidden entirely when the hierarchy is empty. */
function CategoryPickers({ form, locale }: { form: Form; locale: Locale }) {
  const { t } = useTranslation();
  const { control, watch, setValue } = form;
  const { data: categories = [] } = useSupportCategories();
  const categoryId = watch('categoryId');
  const subs = categories.find((c) => c.id === categoryId)?.children ?? [];

  if (categories.length === 0) return null;
  const opts = categories.map((c) => ({ value: String(c.id), label: categoryName(c, locale) }));
  const subOpts = (subs ?? []).map((c) => ({
    value: String(c.id),
    label: categoryName(c, locale),
  }));

  return (
    <>
      <SupportField label={t('support.ticket.categoryLabel')}>
        <Select
          value={categoryId ? String(categoryId) : ''}
          onChange={(v) => {
            setValue('categoryId', Number(v));
            setValue('subcategoryId', null);
          }}
          options={opts}
          placeholder={t('support.ticket.categoryPlaceholder')}
        />
      </SupportField>
      {subOpts.length > 0 ? (
        <SupportField label={t('support.ticket.subcategoryLabel')}>
          <Controller
            control={control}
            name="subcategoryId"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ''}
                onChange={(v) => field.onChange(Number(v))}
                options={subOpts}
                placeholder={t('support.ticket.subcategoryPlaceholder')}
              />
            )}
          />
        </SupportField>
      ) : null}
    </>
  );
}

export function NewTicketFormFields({ form, locale }: { form: Form; locale: Locale }) {
  return (
    <>
      <TicketTextFields form={form} />
      <CategoryPickers form={form} locale={locale} />
      <PrioritySelect control={form.control} />
    </>
  );
}
