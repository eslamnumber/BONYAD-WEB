import { type Metadata } from 'next';

import {
  ForgotPasswordPage as ForgotPasswordPageComponent,
  getAuthHeaderLabels,
} from '@/features/auth';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return {
    title: t('auth.forgotPassword.pageTitle'),
    description: t('auth.forgotPassword.metaDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function ForgotPasswordRoutePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const [locale, params] = await Promise.all([getServerLocale(), searchParams]);
  const { t } = getTranslations(locale);
  const role = params.role === 'TECHNICIAN' ? 'TECHNICIAN' : 'USER';

  const labels = {
    heading: t('auth.forgotPassword.heading'),
    subheading: t('auth.forgotPassword.subheading'),
    phoneLabel: t('auth.forgotPassword.phoneLabel'),
    phonePlaceholder: t('auth.forgotPassword.phonePlaceholder'),
    phoneAriaLabel: t('auth.forgotPassword.phoneAriaLabel'),
    phoneHint: t('auth.hints.phoneFormat'),
    submitButton: t('auth.forgotPassword.submitButton'),
    backToLogin: t('auth.forgotPassword.backToLogin'),
    roleCustomer: t('auth.register.roleCustomer'),
    roleProfessional: t('auth.register.roleProfessional'),
    roleToggleAriaLabel: t('auth.register.roleToggleAriaLabel'),
    headingBrand: t('site.name'),
    errors: {
      genericError: t('auth.errors.genericError'),
    },
  };

  return (
    <ForgotPasswordPageComponent
      labels={labels}
      accountRole={role}
      locale={locale}
      headerLabels={getAuthHeaderLabels(t, locale)}
    />
  );
}
