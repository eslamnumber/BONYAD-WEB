'use client';

import Link from 'next/link';
import { type UseFormRegister } from 'react-hook-form';

import { EyeIcon, LockIcon } from '@/components/icons';
import { FieldHint, Input } from '@/components/ui';
import { Label } from '@/components/ui/label';

import { type LoginFormValues } from '../schemas/login.schema';

import { type FormLabels } from './login-form-labels';

type Pick7 = Pick<
  FormLabels,
  | 'passwordLabel'
  | 'passwordPlaceholder'
  | 'passwordAriaLabel'
  | 'togglePasswordVisibility'
  | 'forgotPassword'
>;

function ToggleButton({ onToggle, ariaLabel }: { onToggle: () => void; ariaLabel: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={ariaLabel}
      className="text-foreground/60 hover:text-foreground focus-visible:outline-ring absolute start-3 top-1/2 -translate-y-1/2 transition-colors focus-visible:outline-2"
    >
      <EyeIcon className="size-6" aria-hidden />
    </button>
  );
}

export type LoginPasswordFieldProps = {
  register: UseFormRegister<LoginFormValues>;
  errorText?: string;
  showPassword: boolean;
  onToggle: () => void;
  forgotPasswordHref: string;
  labels: Pick7;
};

export function LoginPasswordField(p: LoginPasswordFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="login-password" className="sr-only">
        {p.labels.passwordLabel}
      </Label>
      <div className="relative">
        <Input
          id="login-password"
          type={p.showPassword ? 'text' : 'password'}
          aria-label={p.labels.passwordAriaLabel}
          placeholder={p.labels.passwordPlaceholder}
          autoComplete="current-password"
          {...p.register('password')}
          className="bg-login-bg focus-visible:ring-primary h-12 rounded-[6px] border-slate-300 ps-12 pe-11 text-end text-base"
        />
        <ToggleButton onToggle={p.onToggle} ariaLabel={p.labels.togglePasswordVisibility} />
        <span
          className="text-foreground/60 pointer-events-none absolute end-3 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <LockIcon className="size-6" />
        </span>
      </div>
      {p.errorText && <FieldHint tone="error">{p.errorText}</FieldHint>}
      <div className="flex justify-end">
        <Link
          href={p.forgotPasswordHref}
          className="text-primary focus-visible:outline-ring text-sm font-medium transition-opacity hover:opacity-80 focus-visible:outline-2"
        >
          <bdi>{p.labels.forgotPassword}</bdi>
        </Link>
      </div>
    </div>
  );
}
