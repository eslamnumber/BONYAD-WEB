'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, FieldHint, Input } from '@/components/ui';
import { Label } from '@/components/ui/label';

const onlyDigits = (v: string) => v.replace(/\D/g, '').slice(0, 10);

type Props = {
  /** Pre-fills the National ID field from the profile; the user can still edit it. */
  defaultNationalId?: string;
  pending: boolean;
  onSubmit: (companyName: string, crNumber: string, nationalId: string) => void;
};

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  inputMode?: 'numeric';
  hint?: string;
};

/**
 * One labelled field — the Figma input: 48px tall, `slate-300` border (`border-input`),
 * end-aligned value/label. Inherits the document dir (no `dir="auto"`) so the edge stays
 * pinned to the label whether the value is empty or holds Arabic/Latin text (rule 4).
 */
function Field({ id, label, value, onChange, placeholder, inputMode, hint }: FieldProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <Label htmlFor={id} className="text-foreground text-end text-sm font-medium">
        {label}
      </Label>
      <Input
        id={id}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-md text-end text-base"
      />
      <FieldHint tone="error">{hint}</FieldHint>
    </div>
  );
}

/**
 * Inline "Switch to company" registration form (Figma 1682:8241). Collects the
 * Wathq trio — company name, 10-digit CR, National ID — then hands them to the
 * parent, which verifies via Wathq and flips the profile. "Verify & switch" is
 * gated on a non-empty name, a valid CR, and a non-empty National ID.
 */
export function AccountTypeForm({ defaultNationalId, pending, onSubmit }: Props) {
  const { t } = useTranslation();
  const [companyName, setCompanyName] = useState('');
  const [crNumber, setCrNumber] = useState('');
  const [nationalId, setNationalId] = useState(defaultNationalId ?? '');

  const crValid = /^\d{10}$/.test(crNumber);
  const canSubmit =
    companyName.trim().length > 0 && crValid && nationalId.trim().length > 0 && !pending;

  return (
    <form
      noValidate
      className="flex w-full flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit(companyName.trim(), crNumber, nationalId.trim());
      }}
    >
      <Field
        id="account-type-company-name"
        label={t('profile.accountType.companyName')}
        value={companyName}
        onChange={setCompanyName}
        placeholder={t('profile.accountType.companyNamePlaceholder')}
      />
      <Field
        id="account-type-cr-number"
        label={t('profile.accountType.crNumber')}
        value={crNumber}
        onChange={(v) => setCrNumber(onlyDigits(v))}
        placeholder={t('profile.accountType.crNumberPlaceholder')}
        inputMode="numeric"
        hint={crNumber.length > 0 && !crValid ? t('profile.accountType.crInvalid') : undefined}
      />
      <Field
        id="account-type-national-id"
        label={t('profile.accountType.nationalId')}
        value={nationalId}
        onChange={(v) => setNationalId(onlyDigits(v))}
        placeholder={t('profile.accountType.nationalIdPlaceholder')}
        inputMode="numeric"
      />
      <Button type="submit" disabled={!canSubmit} className="mt-2 h-12 w-full text-base">
        {pending ? t('profile.accountType.verifying') : t('profile.accountType.submit')}
      </Button>
    </form>
  );
}
