'use client';

import { type UseFormRegister } from 'react-hook-form';

import { EyeIcon, LockIcon } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { type RegisterFormValues } from '../../schemas/register.schema';
import { PasswordRulesList } from '../password-rules-list';

import { FieldFooter } from './field-footer';

function ToggleButton({ onToggle, toggleLabel }: { onToggle: () => void; toggleLabel: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={toggleLabel}
      className="text-foreground/60 hover:text-foreground focus-visible:outline-ring absolute start-3 top-1/2 -translate-y-1/2 transition-colors focus-visible:outline-2"
    >
      <EyeIcon className="size-6" aria-hidden />
    </button>
  );
}

export type PasswordInputProps = {
  id: string;
  fieldName: 'password' | 'confirmPassword';
  autoComplete: string;
  ariaLabel: string;
  placeholder: string;
  label: string;
  register: UseFormRegister<RegisterFormValues>;
  errorText?: string;
  hint?: string;
  showPassword: boolean;
  onToggle: () => void;
  toggleLabel: string;
  rulesValue?: string;
};

export function PasswordInput(props: PasswordInputProps) {
  const { id, fieldName, autoComplete, ariaLabel, placeholder, label, register } = props;
  const { errorText, hint, showPassword, onToggle, toggleLabel, rulesValue } = props;
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          aria-label={ariaLabel}
          placeholder={placeholder}
          autoComplete={autoComplete}
          {...register(fieldName)}
          className="bg-login-bg focus-visible:ring-primary h-12 rounded-[6px] border-slate-300 ps-12 pe-11 text-end text-base"
        />
        <ToggleButton onToggle={onToggle} toggleLabel={toggleLabel} />
        <span
          className="text-foreground/60 pointer-events-none absolute end-3 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <LockIcon className="size-6" />
        </span>
      </div>
      <FieldFooter errorText={errorText} hint={hint} />
      {rulesValue !== undefined && <PasswordRulesList value={rulesValue} />}
    </div>
  );
}
