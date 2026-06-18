'use client';

import { useState } from 'react';
import { type UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { EyeIcon } from '@/components/icons';
import { Button, FieldHint } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useChangePasswordSubmit } from '../hooks/use-change-password-submit';

import { PasswordRulesList } from './password-rules-list';

const K = 'profile.myInfo.changePassword';

/**
 * Success / error banner. The message is punctuated copy (success key or the
 * pre-localised backend error), so it carries `dir="auto"` + `text-start` (rule 4).
 */
function Banner({ tone, children }: { tone: 'success' | 'error'; children: string }) {
  return (
    <p
      dir="auto"
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-xl px-4 py-3 text-start text-sm font-medium ${tone === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}
    >
      {children}
    </p>
  );
}

type FieldProps = {
  id: string;
  label: string;
  autoComplete: string;
  field: UseFormRegisterReturn;
  error?: string;
};

/** Labelled password input with a show/hide toggle and an error hint. */
function PasswordField({ id, label, autoComplete, field, error }: FieldProps) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-foreground text-end text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className="bg-field-surface h-11 pe-11 text-end text-[15px]"
          {...field}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={t(show ? `${K}.hidePassword` : `${K}.showPassword`)}
          className="text-muted-foreground hover:text-foreground focus-visible:outline-ring absolute inset-y-0 end-0 flex w-11 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <EyeIcon className="size-5" aria-hidden />
        </button>
      </div>
      <FieldHint tone="error">{error ? t(error) : undefined}</FieldHint>
    </div>
  );
}

/** Change-password form — rendered inline under the "Change password" row of My info. */
export function ChangePasswordForm() {
  const { t } = useTranslation();
  const { form, onSubmit, isPending, success } = useChangePasswordSubmit();
  const { errors } = form.formState;
  const newValue = form.watch('newPassword');

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {success ? <Banner tone="success">{t(`${K}.success`)}</Banner> : null}
      {errors.root?.message ? <Banner tone="error">{errors.root.message}</Banner> : null}

      <PasswordField
        id="cp-old"
        label={t(`${K}.oldLabel`)}
        autoComplete="current-password"
        field={form.register('oldPassword')}
        error={errors.oldPassword?.message}
      />
      <div className="flex flex-col gap-2">
        <PasswordField
          id="cp-new"
          label={t(`${K}.newLabel`)}
          autoComplete="new-password"
          field={form.register('newPassword')}
          error={errors.newPassword?.message}
        />
        <PasswordRulesList value={newValue ?? ''} />
      </div>
      <PasswordField
        id="cp-confirm"
        label={t(`${K}.confirmLabel`)}
        autoComplete="new-password"
        field={form.register('confirmPassword')}
        error={errors.confirmPassword?.message}
      />

      <Button type="submit" disabled={isPending} className="h-11 self-end px-6">
        {isPending ? t(`${K}.saving`) : t(`${K}.submit`)}
      </Button>
    </form>
  );
}
