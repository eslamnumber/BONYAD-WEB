'use client';

import { Building2, Info } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LockIcon } from '@/components/icons';
import { Button, FieldHint, Input, Modal, ModalFooter, ModalHeader } from '@/components/ui';
import { Label } from '@/components/ui/label';

const onlyDigits = (v: string) => v.replace(/\D/g, '').slice(0, 10);

type Props = {
  open: boolean;
  onClose: () => void;
  /** From the profile — read-only here; an empty value blocks the Wathq check. */
  nationalId?: string;
  pending: boolean;
  /** Already-localised verify/update error to show under the form. */
  errorMessage?: string;
  onSubmit: (companyName: string, crNumber: string) => void;
};

/** Rounded blue header badge — the company glyph, centred. */
function HeaderBadge() {
  return (
    <div className="flex justify-center">
      <span className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-full">
        <Building2 className="size-7" aria-hidden />
      </span>
    </div>
  );
}

/** Read-only National ID box — leading lock affordance, value isolated via <bdi>. */
function ReadOnlyNationalId({ nationalId }: { nationalId?: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-foreground text-end text-sm font-medium">
        {t('profile.accountType.modal.nationalId')}
      </Label>
      <div className="bg-muted/40 border-border flex h-11 items-center gap-2 rounded-lg border px-3">
        <LockIcon className="text-muted-foreground size-4 shrink-0" aria-hidden />
        <bdi className="text-foreground flex-1 text-end text-[15px]">{nationalId || '—'}</bdi>
      </div>
      {!nationalId ? (
        <FieldHint tone="error">{t('profile.accountType.modal.nationalIdMissing')}</FieldHint>
      ) : null}
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  /**
   * Content edge — both fields use 'end' so the value/placeholder anchors to the
   * same physical side as the end-aligned label (right in `ar`, left in `en` under
   * the inverted mapping). Inherits the document dir (no `dir="auto"`), keeping the
   * edge consistent whether the field is empty or holds Arabic/Latin text.
   */
  align: 'start' | 'end';
  inputMode?: 'numeric';
  hint?: string;
};

/** Labelled text field with the modal's field-surface styling + an optional error hint. */
function LabeledInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  align,
  inputMode,
  hint,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-foreground text-end text-sm font-medium">
        {label}
      </Label>
      <Input
        id={id}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`bg-field-surface h-11 text-[15px] ${align === 'end' ? 'text-end' : 'text-start'}`}
      />
      <FieldHint tone="error">{hint}</FieldHint>
    </div>
  );
}

type FieldsProps = {
  idBase: string;
  nationalId?: string;
  companyName: string;
  setCompanyName: (v: string) => void;
  crNumber: string;
  setCrNumber: (v: string) => void;
  crValid: boolean;
  errorMessage?: string;
};

/** The scrollable field stack: info note, read-only National ID, name + CR, error. */
function CompanyFormFields(p: FieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-5 p-6">
      <HeaderBadge />
      <div className="bg-info/10 flex items-start gap-2.5 rounded-lg p-3">
        <Info className="text-info mt-0.5 size-4 shrink-0" aria-hidden />
        <p dir="auto" className="text-info flex-1 text-start text-[13px] leading-[1.5]">
          {t('profile.accountType.modal.info')}
        </p>
      </div>
      <ReadOnlyNationalId nationalId={p.nationalId} />
      <LabeledInput
        id={`${p.idBase}-name`}
        label={t('profile.accountType.modal.companyName')}
        value={p.companyName}
        onChange={p.setCompanyName}
        placeholder={t('profile.accountType.modal.companyNamePlaceholder')}
        align="end"
      />
      <LabeledInput
        id={`${p.idBase}-cr`}
        label={t('profile.accountType.modal.crNumber')}
        value={p.crNumber}
        onChange={(v) => p.setCrNumber(onlyDigits(v))}
        placeholder={t('profile.accountType.modal.crNumberPlaceholder')}
        align="end"
        inputMode="numeric"
        hint={
          p.crNumber.length > 0 && !p.crValid ? t('profile.accountType.modal.crInvalid') : undefined
        }
      />
      <FieldHint tone="error">{p.errorMessage}</FieldHint>
    </div>
  );
}

/**
 * Registration form body + footer. Mounted only while the sheet is open (the
 * Modal renders nothing when closed), so its field state resets on every open
 * without a sync effect. Owns name/CR; National ID is read-only.
 */
function CompanyForm({
  nationalId,
  pending,
  errorMessage,
  onSubmit,
  onClose,
}: Omit<Props, 'open'>) {
  const { t } = useTranslation();
  const idBase = useId();
  const [companyName, setCompanyName] = useState('');
  const [crNumber, setCrNumber] = useState('');

  const crValid = /^\d{10}$/.test(crNumber);
  const canSubmit = companyName.trim().length > 0 && crValid && Boolean(nationalId) && !pending;

  return (
    <>
      <CompanyFormFields
        idBase={idBase}
        nationalId={nationalId}
        companyName={companyName}
        setCompanyName={setCompanyName}
        crNumber={crNumber}
        setCrNumber={setCrNumber}
        crValid={crValid}
        errorMessage={errorMessage}
      />
      <ModalFooter>
        <Button
          type="button"
          onClick={() => onSubmit(companyName.trim(), crNumber)}
          disabled={!canSubmit}
          className="h-11 flex-1"
        >
          {pending
            ? t('profile.accountType.modal.verifying')
            : t('profile.accountType.modal.submit')}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onClose}
          className="h-11 flex-1"
        >
          {t('profile.accountType.modal.cancel')}
        </Button>
      </ModalFooter>
    </>
  );
}

/**
 * Company registration sheet (iOS `CompanyRegistrationSheet`). "Verify & switch"
 * is gated on a valid CR, a non-empty name, and a present National ID; the parent
 * runs Wathq → profile update and feeds any error into {@link Props.errorMessage}.
 */
export function CompanyRegistrationModal({ open, onClose, ...form }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} className="max-w-[460px]">
      <ModalHeader
        titleId={titleId}
        title={t('profile.accountType.modal.title')}
        closeLabel={t('profile.accountType.modal.close')}
        onClose={onClose}
      />
      <CompanyForm onClose={onClose} {...form} />
    </Modal>
  );
}
