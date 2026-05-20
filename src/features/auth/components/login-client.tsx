'use client';

import { useState } from 'react';

import { type FormLabels, LoginForm } from './login-form';

type Role = 'USER' | 'TECHNICIAN';

export type LoginClientLabels = FormLabels & {
  roleCustomer: string;
  roleProfessional: string;
  roleToggleAriaLabel: string;
};

function RoleToggle({
  role,
  onRoleChange,
  labels,
}: {
  role: Role;
  onRoleChange: (r: Role) => void;
  labels: Pick<LoginClientLabels, 'roleCustomer' | 'roleProfessional' | 'roleToggleAriaLabel'>;
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
        className={`focus-visible:outline-ring flex flex-1 items-center justify-center rounded-full text-sm font-semibold transition-colors focus-visible:outline-2 ${
          role === 'USER'
            ? 'bg-toggle-highlight text-foreground shadow-sm'
            : 'text-toggle-inactive hover:text-foreground'
        }`}
      >
        {labels.roleCustomer}
      </button>
      <button
        type="button"
        aria-pressed={role === 'TECHNICIAN'}
        onClick={() => onRoleChange('TECHNICIAN')}
        className={`focus-visible:outline-ring flex flex-1 items-center justify-center rounded-full text-sm font-semibold transition-colors focus-visible:outline-2 ${
          role === 'TECHNICIAN'
            ? 'bg-toggle-highlight text-foreground shadow-sm'
            : 'text-toggle-inactive hover:text-foreground'
        }`}
      >
        {labels.roleProfessional}
      </button>
    </div>
  );
}

export function LoginClient({ labels }: { labels: LoginClientLabels }) {
  const [role, setRole] = useState<Role>('USER');

  return (
    <div className="flex flex-col gap-6">
      <RoleToggle role={role} onRoleChange={setRole} labels={labels} />
      <LoginForm labels={labels} userRole={role} />
    </div>
  );
}
