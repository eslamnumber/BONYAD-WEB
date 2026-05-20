'use client';

import { type UseFormRegister } from 'react-hook-form';

import { type RegisterFormValues } from '../../schemas/register.schema';
import { type RegisterFormLabels } from '../register-form.types';

import { PasswordInput } from './password-input';

export type PasswordFieldGroupProps = {
  register: UseFormRegister<RegisterFormValues>;
  showPwd: boolean;
  showConfirmPwd: boolean;
  onTogglePwd: () => void;
  onToggleConfirm: () => void;
  passwordValue: string;
  passwordError?: string;
  confirmError?: string;
  confirmHint?: string;
  labels: RegisterFormLabels;
};

export function PasswordFieldGroup(p: PasswordFieldGroupProps) {
  return (
    <>
      <PasswordInput
        id="register-password"
        fieldName="password"
        autoComplete="new-password"
        ariaLabel={p.labels.passwordAriaLabel}
        placeholder={p.labels.passwordPlaceholder}
        label={p.labels.passwordLabel}
        register={p.register}
        errorText={p.passwordError}
        showPassword={p.showPwd}
        onToggle={p.onTogglePwd}
        toggleLabel={p.labels.togglePasswordVisibility}
        rulesValue={p.passwordValue}
      />
      <PasswordInput
        id="register-confirm-password"
        fieldName="confirmPassword"
        autoComplete="new-password"
        ariaLabel={p.labels.confirmPasswordAriaLabel}
        placeholder={p.labels.confirmPasswordPlaceholder}
        label={p.labels.confirmPasswordLabel}
        register={p.register}
        errorText={p.confirmError}
        hint={p.confirmHint}
        showPassword={p.showConfirmPwd}
        onToggle={p.onToggleConfirm}
        toggleLabel={p.labels.togglePasswordVisibility}
      />
    </>
  );
}
