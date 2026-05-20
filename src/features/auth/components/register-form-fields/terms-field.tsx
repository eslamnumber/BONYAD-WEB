'use client';

import { type UseFormRegister } from 'react-hook-form';

import { CheckboxIcon } from '@/components/icons';

import { type RegisterFormValues } from '../../schemas/register.schema';
import { type RegisterFormLabels } from '../register-form.types';

import { FieldFooter } from './field-footer';

type Props = {
  register: UseFormRegister<RegisterFormValues>;
  errorText?: string;
  labels: Pick<RegisterFormLabels, 'termsText'>;
};

export function TermsField({ register, errorText, labels }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-end gap-2">
        <label
          htmlFor="register-terms"
          className="text-foreground/60 flex-1 cursor-pointer text-end text-sm"
        >
          {labels.termsText}
        </label>
        <div className="relative mt-0.5 shrink-0">
          <input
            id="register-terms"
            type="checkbox"
            {...register('terms')}
            className="peer absolute inset-0 size-full cursor-pointer opacity-0"
          />
          <CheckboxIcon
            className="peer-checked:text-primary peer-focus-visible:outline-ring pointer-events-none size-4 text-slate-300 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
            aria-hidden
          />
        </div>
      </div>
      <FieldFooter errorText={errorText} />
    </div>
  );
}
