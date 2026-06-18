'use client';

import { useId } from 'react';
import { type Control, Controller, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Input, Select, Textarea } from '@/components/ui';

import { FEEDBACK_CATEGORIES, MESSAGE_MAX, type FeedbackFormValues } from '../schemas/feedback';

import { FeedbackField } from './feedback-field';

/** Category picker — a {@link Select} bound to the form control. */
function CategorySelect({ control }: { control: Control<FeedbackFormValues> }) {
  const { t } = useTranslation();
  const id = useId();
  const options = FEEDBACK_CATEGORIES.map((c) => ({
    value: c,
    label: t(`feedback.categories.${c.toLowerCase()}`),
  }));
  return (
    <FeedbackField label={t('feedback.new.categoryLabel')} htmlFor={id}>
      <Controller
        control={control}
        name="category"
        render={({ field }) => (
          <Select
            id={id}
            value={field.value}
            onChange={field.onChange}
            options={options}
            placeholder={t('feedback.new.categoryPlaceholder')}
          />
        )}
      />
    </FeedbackField>
  );
}

/** Category + optional subject + required message (1000-char cap with a live counter). */
export function FeedbackFormFields({ form }: { form: UseFormReturn<FeedbackFormValues> }) {
  const { t } = useTranslation();
  const subjectId = useId();
  const messageId = useId();
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form;
  const messageLength = (watch('message') ?? '').length;

  return (
    <>
      <CategorySelect control={control} />
      <FeedbackField
        label={t('feedback.new.subjectLabel')}
        htmlFor={subjectId}
        error={errors.subject?.message}
      >
        <Input
          id={subjectId}
          className="text-start"
          maxLength={120}
          placeholder={t('feedback.new.subjectPlaceholder')}
          {...register('subject')}
        />
      </FeedbackField>
      <FeedbackField
        label={t('feedback.new.messageLabel')}
        htmlFor={messageId}
        error={errors.message?.message}
        counter={t('feedback.new.counter', { current: messageLength, max: MESSAGE_MAX })}
      >
        <Textarea
          id={messageId}
          rows={5}
          maxLength={MESSAGE_MAX}
          className="text-start"
          placeholder={t('feedback.new.messagePlaceholder')}
          {...register('message')}
        />
      </FeedbackField>
    </>
  );
}
