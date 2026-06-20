'use client';

import { type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useResetPasswordForm } from '../hooks/use-reset-password-form';
import { type ResetPasswordFormValues } from '../schemas/reset-password.schema';

import { AuthPasswordField } from './auth-password-field';
import { OtpBoxes } from './otp-boxes';
import { PasswordRulesList } from './password-rules-list';
import { ResendSection } from './verify-otp-sections';

type Role = 'USER' | 'TECHNICIAN';

export type ResetPasswordFormLabels = {
  otpLabel: string;
  otpAriaLabel: string;
  newPasswordLabel: string;
  newPasswordPlaceholder: string;
  newPasswordAriaLabel: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  confirmPasswordAriaLabel: string;
  showPassword: string;
  hidePassword: string;
  submitButton: string;
  didNotReceiveCode: string;
  resendCode: string;
  resendAriaLabel: string;
  successMessage: string;
  errors: { genericError: string };
};

function SuccessMessage({ label }: { label: string }) {
  return (
    <p dir="auto" className="text-success text-center text-base font-medium" role="status">
      {label}
    </p>
  );
}

function OtpField({
  value,
  onChange,
  label,
  ariaLabel,
  disabled,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  ariaLabel: string;
  disabled: boolean;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-foreground text-end text-sm font-medium">{label}</span>
      <OtpBoxes value={value} onChange={onChange} ariaLabel={ariaLabel} disabled={disabled} />
      {error && (
        <p className="text-destructive text-center text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordFields({
  form,
  labels,
  toggleLabels,
}: {
  form: UseFormReturn<ResetPasswordFormValues>;
  labels: ResetPasswordFormLabels;
  toggleLabels: { show: string; hide: string };
}) {
  const { errors } = form.formState;
  const newValue = form.watch('newPassword');
  return (
    <>
      <div className="flex flex-col gap-1">
        <AuthPasswordField
          id="reset-new-password"
          label={labels.newPasswordLabel}
          placeholder={labels.newPasswordPlaceholder}
          ariaLabel={labels.newPasswordAriaLabel}
          autoComplete="new-password"
          field={form.register('newPassword')}
          error={errors.newPassword?.message}
          toggleLabels={toggleLabels}
        />
        <PasswordRulesList value={newValue ?? ''} />
      </div>
      <AuthPasswordField
        id="reset-confirm-password"
        label={labels.confirmPasswordLabel}
        placeholder={labels.confirmPasswordPlaceholder}
        ariaLabel={labels.confirmPasswordAriaLabel}
        autoComplete="new-password"
        field={form.register('confirmPassword')}
        error={errors.confirmPassword?.message}
        toggleLabels={toggleLabels}
      />
    </>
  );
}

export function ResetPasswordForm({
  labels,
  phone,
  accountRole,
}: {
  labels: ResetPasswordFormLabels;
  phone: string;
  accountRole: Role;
}) {
  const { t } = useTranslation();
  const state = useResetPasswordForm(phone, accountRole, labels.errors.genericError);
  const { form, mutation, otpValue, secondsLeft, isPending, canResend } = state;
  const { onSubmit, handleResend, handleOtpChange } = state;

  if (mutation.isSuccess) return <SuccessMessage label={labels.successMessage} />;

  const otpMsg = form.formState.errors.otp?.message;
  const toggleLabels = { show: labels.showPassword, hide: labels.hidePassword };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <OtpField
        value={otpValue}
        onChange={handleOtpChange}
        label={labels.otpLabel}
        ariaLabel={labels.otpAriaLabel}
        disabled={isPending}
        error={otpMsg ? t(otpMsg) : undefined}
      />
      <PasswordFields form={form} labels={labels} toggleLabels={toggleLabels} />
      {form.formState.errors.root && (
        <p className="text-destructive text-center text-sm" role="alert">
          {form.formState.errors.root.message}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-primary-foreground focus-visible:outline-ring h-[55px] w-full rounded-full text-base font-semibold transition-opacity focus-visible:outline-2 disabled:opacity-60 motion-safe:hover:opacity-90"
      >
        {labels.submitButton}
      </button>
      <ResendSection
        labels={labels}
        secondsLeft={secondsLeft}
        canResend={canResend}
        onResend={handleResend}
      />
    </form>
  );
}
