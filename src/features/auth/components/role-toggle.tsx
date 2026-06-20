'use client';

type Role = 'USER' | 'TECHNICIAN';

export type RoleToggleLabels = {
  roleCustomer: string;
  roleProfessional: string;
  roleToggleAriaLabel: string;
};

/**
 * User / Service-provider pill toggle shared across the auth screens
 * (login, forgot-password, verify-otp). Markup is identical everywhere so the
 * three flows stay visually in sync — keep edits here, never fork a copy.
 */
export function RoleToggle({
  role,
  onRoleChange,
  labels,
}: {
  role: Role;
  onRoleChange: (r: Role) => void;
  labels: RoleToggleLabels;
}) {
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
