'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { type UseFormRegister, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/config/routes';
import { ApiError } from '@/lib/api-client';

import { useRegister } from '../api/register';
import { registerFormSchema, type RegisterFormValues } from '../schemas/register.schema';

import {
  NameField,
  PasswordInput,
  PhoneField,
  TermsField,
  resolveError,
} from './register-form-fields';
import { type RegisterFormLabels } from './register-form.types';

export type { RegisterFormLabels };

type PwdGroupProps = {
  register: UseFormRegister<RegisterFormValues>;
  showPwd: boolean;
  showConfirmPwd: boolean;
  onTogglePwd: () => void;
  onToggleConfirm: () => void;
  passwordError?: string;
  confirmError?: string;
  labels: Pick<
    RegisterFormLabels,
    | 'passwordLabel'
    | 'passwordPlaceholder'
    | 'passwordAriaLabel'
    | 'confirmPasswordLabel'
    | 'confirmPasswordPlaceholder'
    | 'confirmPasswordAriaLabel'
    | 'togglePasswordVisibility'
  >;
};

function PasswordFieldGroup({
  register,
  showPwd,
  showConfirmPwd,
  onTogglePwd,
  onToggleConfirm,
  passwordError,
  confirmError,
  labels,
}: PwdGroupProps) {
  return (
    <>
      <PasswordInput
        id="register-password"
        fieldName="password"
        autoComplete="new-password"
        ariaLabel={labels.passwordAriaLabel}
        placeholder={labels.passwordPlaceholder}
        label={labels.passwordLabel}
        register={register}
        errorText={passwordError}
        showPassword={showPwd}
        onToggle={onTogglePwd}
        toggleLabel={labels.togglePasswordVisibility}
      />
      <PasswordInput
        id="register-confirm-password"
        fieldName="confirmPassword"
        autoComplete="new-password"
        ariaLabel={labels.confirmPasswordAriaLabel}
        placeholder={labels.confirmPasswordPlaceholder}
        label={labels.confirmPasswordLabel}
        register={register}
        errorText={confirmError}
        showPassword={showConfirmPwd}
        onToggle={onToggleConfirm}
        toggleLabel={labels.togglePasswordVisibility}
      />
    </>
  );
}

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

function useRegisterFormLogic({
  labels,
  userRole,
}: {
  labels: RegisterFormLabels;
  userRole: 'USER' | 'TECHNICIAN';
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const mutation = useRegister();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: '', phone: '', password: '', confirmPassword: '', terms: false },
  });

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate(
      { ...values, role: userRole },
      {
        onSuccess: () => {
          const phone = values.phone.replace(/\D/g, '').replace(/^0+/, '').slice(0, 9);
          router.push(`${ROUTES.VERIFY_OTP}?phone=${encodeURIComponent(phone)}&role=${userRole}`);
        },
        onError: (err) => {
          const msg =
            err instanceof ApiError && err.status === 409
              ? labels.errors.phoneAlreadyRegistered
              : labels.errors.genericError;
          form.setError('root', { message: msg });
        },
      },
    ),
  );

  const { errors } = form.formState;
  return {
    form,
    mutation,
    showPwd,
    showConfirmPwd,
    setShowPwd,
    setShowConfirmPwd,
    onSubmit,
    nameError: resolveError(errors.name, t),
    phoneError: resolveError(errors.phone, t),
    passwordError: resolveError(errors.password, t),
    confirmError: resolveError(errors.confirmPassword, t),
    termsError: resolveError(errors.terms, t),
  };
}

export function RegisterForm({
  labels,
  userRole,
}: {
  labels: RegisterFormLabels;
  userRole: 'USER' | 'TECHNICIAN';
}) {
  const {
    form,
    mutation,
    showPwd,
    showConfirmPwd,
    setShowPwd,
    setShowConfirmPwd,
    onSubmit,
    nameError,
    phoneError,
    passwordError,
    confirmError,
    termsError,
  } = useRegisterFormLogic({ labels, userRole });
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <NameField register={form.register} errorText={nameError} labels={labels} />
      <PhoneField register={form.register} errorText={phoneError} labels={labels} />
      <PasswordFieldGroup
        register={form.register}
        showPwd={showPwd}
        showConfirmPwd={showConfirmPwd}
        onTogglePwd={() => setShowPwd((v) => !v)}
        onToggleConfirm={() => setShowConfirmPwd((v) => !v)}
        passwordError={passwordError}
        confirmError={confirmError}
        labels={labels}
      />
      <TermsField register={form.register} errorText={termsError} labels={labels} />
      {form.formState.errors.root && (
        <p className="text-destructive text-center text-sm" role="alert">
          {form.formState.errors.root.message}
        </p>
      )}
      <SubmitButton
        pending={mutation.isPending || form.formState.isSubmitting}
        label={labels.submitButton}
      />
    </form>
  );
}
