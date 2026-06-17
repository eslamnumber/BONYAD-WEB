'use client';

import { type ChangeEvent, type ReactNode, useId } from 'react';
import { type UseFormRegisterReturn, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { SaudiRiyalIcon } from '@/components/icons';
import { Button, FieldHint, Modal, ModalFooter, ModalHeader } from '@/components/ui';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { type SubmittedOffer, type SubmitOfferFormValues } from '../../schemas/submit-offer.schema';

import { useSubmitOffer } from './use-submit-offer';

const digitsOnly = (v: string) => v.replace(/[^\d]/g, '');
const decimal = (v: string) => v.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
const SAVE =
  'bg-brand-dark-navy text-on-media h-11 flex-1 rounded-lg text-base font-medium motion-safe:hover:opacity-90';

type Props = {
  open: boolean;
  projectId: number;
  offer: SubmittedOffer;
  onClose: () => void;
  onSaved: (offer: SubmittedOffer) => void;
};

/**
 * Edit-offer modal (Figma "Modal-Card", node 1103:7281). Re-opens the SP's bid
 * pre-filled and saves via delete-then-create ({@link useSubmitOffer} with
 * `replaceBidId`). The bid-status card stays mounted behind it — this replaces
 * the old inline edit that swapped the card for the form.
 */
export function EditOfferModal({ open, projectId, offer, onClose, onSaved }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const { form, onSubmit, isPending } = useSubmitOffer(projectId, {
    defaultValues: offer.values,
    replaceBidId: offer.id,
    onSubmitted: onSaved,
  });
  const pending = isPending || form.formState.isSubmitting;

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <ModalHeader
        titleId={titleId}
        title={t('dashboard.jobOffer.editModal.title')}
        closeLabel={t('dashboard.jobOffer.editModal.close')}
        onClose={onClose}
      />
      <form onSubmit={onSubmit} noValidate className="flex flex-col">
        <OfferEditFields form={form} />
        <EditFooter pending={pending} onClose={onClose} />
      </form>
    </Modal>
  );
}

function OfferEditFields({ form }: { form: UseFormReturn<SubmitOfferFormValues> }) {
  const { t } = useTranslation();
  const { errors } = form.formState;
  return (
    <div className="flex flex-col gap-6 p-6">
      <PrefixField
        id="edit-offer-value"
        label={t('dashboard.jobOffer.status.valueLabel')}
        prefix={<RiyalPrefix />}
        inputMode="decimal"
        filter={decimal}
        field={form.register('proposedBudget')}
        error={errors.proposedBudget?.message}
      />
      <PrefixField
        id="edit-offer-duration"
        label={t('dashboard.jobOffer.status.durationLabel')}
        prefix={t('dashboard.jobOffer.editModal.durationUnit')}
        inputMode="numeric"
        filter={digitsOnly}
        field={form.register('durationWeeks')}
        error={errors.durationWeeks?.message}
      />
      <DetailsField field={form.register('comment')} error={errors.comment?.message} />
      <FieldHint tone="error">
        {errors.root?.message ? t(errors.root.message) : undefined}
      </FieldHint>
      <InfoNote text={t('dashboard.jobOffer.editModal.note')} />
    </div>
  );
}

function EditFooter({ pending, onClose }: { pending: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <ModalFooter>
      <Button type="submit" disabled={pending} className={SAVE}>
        {t('dashboard.jobOffer.editModal.save')}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={onClose}
        className="border-border text-muted-foreground h-11 w-[100px] rounded-lg text-base font-medium"
      >
        {t('dashboard.jobOffer.status.cancel')}
      </Button>
    </ModalFooter>
  );
}

/** Riyal glyph + sr-only currency name, used as the offer-value field prefix. */
function RiyalPrefix() {
  const { t } = useTranslation();
  return (
    <>
      <SaudiRiyalIcon className="h-4 w-auto shrink-0" aria-hidden />
      <span className="sr-only">{t('dashboard.jobOffer.status.valueCurrency')}</span>
    </>
  );
}

type PrefixFieldProps = {
  id: string;
  label: string;
  prefix: ReactNode;
  inputMode: 'numeric' | 'decimal';
  filter: (v: string) => string;
  field: UseFormRegisterReturn;
  error?: string;
};

/** Labelled field with a unit prefix inside the input box (riyal glyph / "weeks"). */
function PrefixField({ id, label, prefix, inputMode, filter, field, error }: PrefixFieldProps) {
  const { t } = useTranslation();
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.value = filter(e.target.value);
    field.onChange(e);
  };
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor={id} className="text-foreground text-end text-sm font-medium">
        {label}
      </Label>
      <div className="bg-field-surface border-border focus-within:ring-ring/50 flex h-11 items-center gap-2 rounded-lg border px-3 focus-within:ring-2">
        <span className="text-muted-foreground flex shrink-0 items-center text-sm">{prefix}</span>
        <input
          id={id}
          inputMode={inputMode}
          className="text-foreground min-w-0 flex-1 bg-transparent text-end text-[15px] outline-none"
          {...field}
          onChange={onChange}
        />
      </div>
      <FieldHint tone="error">{error ? t(error) : undefined}</FieldHint>
    </div>
  );
}

function DetailsField({ field, error }: { field: UseFormRegisterReturn; error?: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor="edit-offer-details" className="text-foreground text-end text-sm font-medium">
        {t('dashboard.jobOffer.editModal.detailsLabel')}
      </Label>
      <Textarea
        id="edit-offer-details"
        className="bg-field-surface border-border text-foreground min-h-[120px] rounded-lg text-end text-[15px]"
        {...field}
      />
      <FieldHint tone="error">{error ? t(error) : undefined}</FieldHint>
    </div>
  );
}

function InfoNote({ text }: { text: string }) {
  return (
    <div className="bg-info/10 flex w-full rounded-lg p-3">
      <p dir="auto" className="text-info flex-1 text-start text-[13px] leading-[1.5]">
        {text}
      </p>
    </div>
  );
}
