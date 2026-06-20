'use client';

import { type VerifyOtpFormLabels } from './verify-otp-form';

export { RoleToggle } from './role-toggle';

type ResendSectionProps = {
  labels: Pick<VerifyOtpFormLabels, 'didNotReceiveCode' | 'resendCode' | 'resendAriaLabel'>;
  secondsLeft: number;
  canResend: boolean;
  onResend: () => void;
};

export function ResendSection({ labels, secondsLeft, canResend, onResend }: ResendSectionProps) {
  const label =
    secondsLeft > 0 ? `${labels.resendCode} (${String(secondsLeft)}s)` : labels.resendCode;
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-muted-foreground text-sm">{labels.didNotReceiveCode}</span>
      <button
        type="button"
        aria-label={labels.resendAriaLabel}
        disabled={!canResend}
        onClick={onResend}
        className="text-primary focus-visible:outline-ring text-sm font-semibold transition-opacity hover:opacity-80 focus-visible:outline-2 disabled:opacity-50"
      >
        {label}
      </button>
    </div>
  );
}
