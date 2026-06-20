'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type Locale } from '@/types/locale';

import { useRegisterTerms } from '../hooks/use-register-terms';

import { type RegisterFormLabels, RegisterForm } from './register-form';
import { TermsModal } from './terms-modal';

type Role = 'USER' | 'TECHNICIAN';

export type RegisterClientLabels = RegisterFormLabels & {
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
  labels: Pick<RegisterClientLabels, 'roleCustomer' | 'roleProfessional' | 'roleToggleAriaLabel'>;
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

export function RegisterClient({ labels }: { labels: RegisterClientLabels }) {
  const { i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const [role, setRole] = useState<Role>('TECHNICIAN');
  const terms = useRegisterTerms(role);

  return (
    <div className="flex flex-col gap-6">
      <RoleToggle role={role} onRoleChange={setRole} labels={labels} />
      <RegisterForm
        labels={labels}
        userRole={role}
        termsId={terms.termsId}
        onOpenTerms={terms.openTerms}
      />
      <TermsModal
        open={terms.isOpen}
        onClose={terms.closeTerms}
        locale={locale}
        query={terms.query}
      />
    </div>
  );
}
