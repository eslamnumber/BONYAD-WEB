'use client';

import { type ChangeEvent } from 'react';
import { type UseFormRegister } from 'react-hook-form';

import { PhoneIcon } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { type RegisterFormValues } from '../../schemas/register.schema';
import { normalizePhoneInput } from '../../utils';
import { type RegisterFormLabels } from '../register-form.types';

import { FieldFooter } from './field-footer';

type Props = {
  register: UseFormRegister<RegisterFormValues>;
  errorText?: string;
  hint?: string;
  labels: Pick<RegisterFormLabels, 'phoneLabel' | 'phonePlaceholder' | 'phoneAriaLabel'>;
};

export function PhoneField({ register, errorText, hint, labels }: Props) {
  const reg = register('phone');
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.value = normalizePhoneInput(e.target.value);
    reg.onChange(e);
  };
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="register-phone" className="sr-only">
        {labels.phoneLabel}
      </Label>
      <div className="relative">
        <Input
          id="register-phone"
          type="tel"
          inputMode="numeric"
          aria-label={labels.phoneAriaLabel}
          placeholder={labels.phonePlaceholder}
          autoComplete="tel"
          {...reg}
          onChange={onChange}
          className="bg-login-bg focus-visible:ring-primary h-12 rounded-[6px] border-slate-300 pe-11 text-end text-base"
        />
        <span
          className="text-foreground/60 pointer-events-none absolute end-3 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <PhoneIcon className="size-6" />
        </span>
      </div>
      <FieldFooter errorText={errorText} hint={hint} />
    </div>
  );
}
