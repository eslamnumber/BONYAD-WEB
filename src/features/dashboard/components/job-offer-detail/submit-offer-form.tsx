'use client';

import { type ChangeEvent } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button, FieldHint, Input } from '@/components/ui';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { useSubmitOffer } from './use-submit-offer';

const FIELD =
  'bg-field-surface border-border h-11 rounded-lg border text-end text-sm placeholder:text-foreground/60';
const ACTION = 'h-12 w-full rounded-lg text-[15px] font-semibold';

const digitsOnly = (v: string) => v.replace(/[^\d]/g, '');
const decimal = (v: string) => v.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');

export function SubmitOfferForm({ projectId }: { projectId: number }) {
  const { t } = useTranslation();
  const { form, onSubmit, isPending, isSuccess } = useSubmitOffer(projectId);
  const { errors, isSubmitting } = form.formState;

  return (
    <section className="bg-card border-border flex w-full flex-col gap-5 rounded-xl border p-6">
      <div className="flex w-full flex-col gap-3">
        <h2 className="text-foreground text-end text-lg font-semibold">
          {t('dashboard.jobOffer.form.heading')}
        </h2>
        <div className="bg-border h-px w-full" />
      </div>
      <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-5">
        <OfferField
          id="offer-price"
          label={t('dashboard.jobOffer.form.priceLabel')}
          placeholder={t('dashboard.jobOffer.form.pricePlaceholder')}
          inputMode="decimal"
          filter={decimal}
          field={form.register('proposedBudget')}
          error={errors.proposedBudget?.message}
        />
        <OfferField
          id="offer-duration"
          label={t('dashboard.jobOffer.form.durationLabel')}
          placeholder={t('dashboard.jobOffer.form.durationPlaceholder')}
          inputMode="numeric"
          filter={digitsOnly}
          field={form.register('durationMonths')}
          error={errors.durationMonths?.message}
        />
        <OfferMessageField field={form.register('comment')} error={errors.comment?.message} />
        <OfferActions
          rootError={errors.root?.message}
          isSuccess={isSuccess}
          pending={isPending || isSubmitting}
        />
      </form>
    </section>
  );
}

type OfferFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  inputMode: 'numeric' | 'decimal';
  filter: (v: string) => string;
  field: UseFormRegisterReturn;
  error?: string;
};

function OfferField({ id, label, placeholder, inputMode, filter, field, error }: OfferFieldProps) {
  const { t } = useTranslation();
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.value = filter(e.target.value);
    field.onChange(e);
  };
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor={id} className="text-foreground text-end text-[13px] font-medium">
        {label}
      </Label>
      <Input
        id={id}
        inputMode={inputMode}
        placeholder={placeholder}
        className={FIELD}
        {...field}
        onChange={onChange}
      />
      <FieldHint tone="error">{error ? t(error) : undefined}</FieldHint>
    </div>
  );
}

function OfferMessageField({ field, error }: { field: UseFormRegisterReturn; error?: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor="offer-message" className="text-foreground text-end text-[13px] font-medium">
        {t('dashboard.jobOffer.form.messageLabel')}
      </Label>
      <Textarea
        id="offer-message"
        dir="auto"
        placeholder={t('dashboard.jobOffer.form.messagePlaceholder')}
        className="bg-field-surface border-border placeholder:text-foreground/60 min-h-[100px] rounded-lg text-end text-sm"
        {...field}
      />
      <FieldHint tone="error">{error ? t(error) : undefined}</FieldHint>
    </div>
  );
}

function OfferActions({
  rootError,
  isSuccess,
  pending,
}: {
  rootError?: string;
  isSuccess: boolean;
  pending: boolean;
}) {
  const { t } = useTranslation();
  return (
    <>
      {rootError ? (
        <p role="alert" className="text-destructive text-end text-sm">
          {t(rootError)}
        </p>
      ) : null}
      {isSuccess ? (
        <p role="status" className="text-success text-end text-sm">
          {t('dashboard.jobOffer.form.success')}
        </p>
      ) : null}
      <div className="flex w-full flex-col gap-3">
        <Button
          type="submit"
          disabled={pending}
          className={`bg-brand-dark-navy text-on-media ${ACTION} motion-safe:hover:opacity-90`}
        >
          {t('dashboard.jobOffer.form.submit')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`border-border text-foreground ${ACTION}`}
        >
          {t('dashboard.jobOffer.form.save')}
        </Button>
      </div>
    </>
  );
}
