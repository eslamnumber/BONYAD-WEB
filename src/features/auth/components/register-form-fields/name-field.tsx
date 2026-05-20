'use client';

import { type ChangeEvent } from 'react';
import { type UseFormRegister } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { type RegisterFormValues } from '../../schemas/register.schema';
import { type RegisterFormLabels } from '../register-form.types';

import { FieldFooter } from './field-footer';

type Props = {
  register: UseFormRegister<RegisterFormValues>;
  errorText?: string;
  hint?: string;
  labels: Pick<RegisterFormLabels, 'nameLabel' | 'namePlaceholder' | 'nameAriaLabel'>;
};

export function NameField({ register, errorText, hint, labels }: Props) {
  const reg = register('name');
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/\d/g, '');
    reg.onChange(e);
  };
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="register-name" className="sr-only">
        {labels.nameLabel}
      </Label>
      <Input
        id="register-name"
        type="text"
        aria-label={labels.nameAriaLabel}
        placeholder={labels.namePlaceholder}
        autoComplete="name"
        {...reg}
        onChange={onChange}
        className="bg-login-bg focus-visible:ring-primary h-12 rounded-[6px] border-slate-300 text-end text-base"
      />
      <FieldFooter errorText={errorText} hint={hint} />
    </div>
  );
}
