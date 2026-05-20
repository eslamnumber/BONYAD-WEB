import { type Metadata } from 'next';

import { LoginPage as LoginPageComponent } from '@/features/auth';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return {
    title: t('auth.login.pageTitle'),
    description: t('auth.login.metaDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage() {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);

  const labels = {
    heading: t('auth.login.heading'),
    headingBrand: t('auth.login.headingBrand'),
    subheading: t('auth.login.subheading'),
    phoneLabel: t('auth.login.phoneLabel'),
    phonePlaceholder: t('auth.login.phonePlaceholder'),
    phoneAriaLabel: t('auth.login.phoneAriaLabel'),
    passwordLabel: t('auth.login.passwordLabel'),
    passwordPlaceholder: t('auth.login.passwordPlaceholder'),
    passwordAriaLabel: t('auth.login.passwordAriaLabel'),
    togglePasswordVisibility: t('auth.login.togglePasswordVisibility'),
    forgotPassword: t('auth.login.forgotPassword'),
    submitButton: t('auth.login.submitButton'),
    noAccount: t('auth.login.noAccount'),
    createAccount: t('auth.login.createAccount'),
    roleCustomer: t('auth.login.roleCustomer'),
    roleProfessional: t('auth.login.roleProfessional'),
    roleToggleAriaLabel: t('auth.login.roleToggleAriaLabel'),
    phoneHint: t('auth.hints.phoneFormat'),
    errors: {
      invalidCredentials: t('auth.errors.invalidCredentials'),
      genericError: t('auth.errors.genericError'),
    },
  };

  return <LoginPageComponent labels={labels} />;
}
