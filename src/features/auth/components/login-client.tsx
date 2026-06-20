'use client';

import { useState } from 'react';

import { type FormLabels, LoginForm } from './login-form';
import { RoleToggle, type RoleToggleLabels } from './role-toggle';

type Role = 'USER' | 'TECHNICIAN';

export type LoginClientLabels = FormLabels & RoleToggleLabels;

export function LoginClient({ labels }: { labels: LoginClientLabels }) {
  const [role, setRole] = useState<Role>('USER');

  return (
    <div className="flex flex-col gap-6">
      <RoleToggle role={role} onRoleChange={setRole} labels={labels} />
      <LoginForm labels={labels} userRole={role} />
    </div>
  );
}
