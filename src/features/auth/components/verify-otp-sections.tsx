'use client';

import { type VerifyOtpFormLabels } from './verify-otp-form';

type Role = 'USER' | 'TECHNICIAN';

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

type RoleToggleProps = {
  role: Role;
  onRoleChange: (r: Role) => void;
  labels: Pick<VerifyOtpFormLabels, 'roleCustomer' | 'roleProfessional' | 'roleToggleAriaLabel'>;
};

export function RoleToggle({ role, onRoleChange, labels }: RoleToggleProps) {
  return (
    <div
      role="group"
      aria-label={labels.roleToggleAriaLabel}
      className="bg-toggle-pill flex h-[52px] rounded-full p-1"
    >
      <button
        type="button"
        aria-pressed={role === 'USER'}
        onClick={() => onRoleChange('USER')}
        className={`focus-visible:outline-ring flex flex-1 items-center justify-center rounded-full text-sm font-semibold transition-colors focus-visible:outline-2 ${role === 'USER' ? 'bg-toggle-highlight text-foreground shadow-sm' : 'text-toggle-inactive hover:text-foreground'}`}
      >
        {labels.roleCustomer}
      </button>
      <button
        type="button"
        aria-pressed={role === 'TECHNICIAN'}
        onClick={() => onRoleChange('TECHNICIAN')}
        className={`focus-visible:outline-ring flex flex-1 items-center justify-center rounded-full text-sm font-semibold transition-colors focus-visible:outline-2 ${role === 'TECHNICIAN' ? 'bg-toggle-highlight text-foreground shadow-sm' : 'text-toggle-inactive hover:text-foreground'}`}
      >
        {labels.roleProfessional}
      </button>
    </div>
  );
}
