'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useRegisterSubmit } from '../hooks/use-register-submit';
import { registerFormSchema, type RegisterFormValues } from '../schemas/register.schema';

import { RegisterFields } from './register-form-fields';
import { type RegisterFormLabels } from './register-form.types';

export type { RegisterFormLabels };

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground focus-visible:outline-ring mt-2 h-[55px] w-full rounded-full text-base font-semibold transition-opacity focus-visible:outline-2 disabled:opacity-60 motion-safe:hover:opacity-90"
    >
      {label}
    </button>
  );
}

export function RegisterForm({
  labels,
  userRole,
}: {
  labels: RegisterFormLabels;
  userRole: 'USER' | 'TECHNICIAN';
}) {
  const { t } = useTranslation();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: '', phone: '', password: '', confirmPassword: '', terms: false },
  });
  const { onSubmit, isPending } = useRegisterSubmit(form, userRole, labels.errors);
  const passwordValue = useWatch({ control: form.control, name: 'password' }) ?? '';
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <RegisterFields
        form={form}
        labels={labels}
        showPwd={showPwd}
        showConfirmPwd={showConfirmPwd}
        onTogglePwd={() => setShowPwd((v) => !v)}
        onToggleConfirm={() => setShowConfirmPwd((v) => !v)}
        passwordValue={passwordValue}
        t={t}
      />
      {form.formState.errors.root && (
        <p className="text-destructive text-center text-sm" role="alert">
          {form.formState.errors.root.message}
        </p>
      )}
      <SubmitButton
        pending={isPending || form.formState.isSubmitting}
        label={labels.submitButton}
      />
    </form>
  );
}
