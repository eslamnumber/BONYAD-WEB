'use client';

import { type UseFormReturn } from 'react-hook-form';

import { type RegisterFormValues } from '../../schemas/register.schema';
import { type RegisterFormLabels } from '../register-form.types';

import { resolveError } from './field-footer';
import { NameField } from './name-field';
import { PasswordFieldGroup } from './password-field-group';
import { PhoneField } from './phone-field';
import { TermsField } from './terms-field';

export type RegisterFieldsProps = {
  form: UseFormReturn<RegisterFormValues>;
  labels: RegisterFormLabels;
  showPwd: boolean;
  showConfirmPwd: boolean;
  onTogglePwd: () => void;
  onToggleConfirm: () => void;
  passwordValue: string;
  t: (k: string) => string;
};

export function RegisterFields(p: RegisterFieldsProps) {
  const errors = p.form.formState.errors;
  return (
    <>
      <NameField
        register={p.form.register}
        errorText={resolveError(errors.name, p.t)}
        hint={p.labels.hints.nameFormat}
        labels={p.labels}
      />
      <PhoneField
        register={p.form.register}
        errorText={resolveError(errors.phone, p.t)}
        hint={p.labels.hints.phoneFormat}
        labels={p.labels}
      />
      <PasswordFieldGroup
        register={p.form.register}
        showPwd={p.showPwd}
        showConfirmPwd={p.showConfirmPwd}
        onTogglePwd={p.onTogglePwd}
        onToggleConfirm={p.onToggleConfirm}
        passwordValue={p.passwordValue}
        passwordError={resolveError(errors.password, p.t)}
        confirmError={resolveError(errors.confirmPassword, p.t)}
        confirmHint={p.labels.hints.passwordConfirm}
        labels={p.labels}
      />
      <TermsField
        register={p.form.register}
        errorText={resolveError(errors.terms, p.t)}
        labels={p.labels}
      />
    </>
  );
}
