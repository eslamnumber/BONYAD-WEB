import { type Metadata } from 'next';

import { getAuthHeaderLabels, RegisterPage as RegisterPageComponent } from '@/features/auth';
import { getTranslations, type TFunction } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return {
    title: t('auth.register.pageTitle'),
    description: t('auth.register.metaDescription'),
    robots: { index: false, follow: false },
  };
}

function getRegisterLabels(t: TFunction) {
  return {
    brandName: t('site.name'),
    heading: t('auth.register.heading'),
    subheading: t('auth.register.subheading'),
    nameLabel: t('auth.register.nameLabel'),
    namePlaceholder: t('auth.register.namePlaceholder'),
    nameAriaLabel: t('auth.register.nameAriaLabel'),
    phoneLabel: t('auth.register.phoneLabel'),
    phonePlaceholder: t('auth.register.phonePlaceholder'),
    phoneAriaLabel: t('auth.register.phoneAriaLabel'),
    passwordLabel: t('auth.register.passwordLabel'),
    passwordPlaceholder: t('auth.register.passwordPlaceholder'),
    passwordAriaLabel: t('auth.register.passwordAriaLabel'),
    confirmPasswordLabel: t('auth.register.confirmPasswordLabel'),
    confirmPasswordPlaceholder: t('auth.register.confirmPasswordPlaceholder'),
    confirmPasswordAriaLabel: t('auth.register.confirmPasswordAriaLabel'),
    togglePasswordVisibility: t('auth.register.togglePasswordVisibility'),
    termsAgreePrefix: t('auth.register.termsAgreePrefix'),
    termsLinkText: t('auth.register.termsLinkText'),
    termsAgreeSuffix: t('auth.register.termsAgreeSuffix'),
    termsAriaLabel: t('auth.register.termsAriaLabel'),
    submitButton: t('auth.register.submitButton'),
    hasAccount: t('auth.register.hasAccount'),
    loginLink: t('auth.register.loginLink'),
    roleCustomer: t('auth.register.roleCustomer'),
    roleProfessional: t('auth.register.roleProfessional'),
    roleToggleAriaLabel: t('auth.register.roleToggleAriaLabel'),
    hints: {
      phoneFormat: t('auth.hints.phoneFormat'),
      nameFormat: t('auth.hints.nameFormat'),
      passwordConfirm: t('auth.hints.passwordConfirm'),
    },
    errors: {
      nameRequired: t('auth.errors.nameRequired'),
      nameTooShort: t('auth.errors.nameTooShort'),
      phoneRequired: t('auth.errors.phoneRequired'),
      phoneInvalid: t('auth.errors.phoneInvalid'),
      passwordRequired: t('auth.errors.passwordRequired'),
      passwordTooShort: t('auth.errors.passwordTooShort'),
      confirmPasswordRequired: t('auth.errors.confirmPasswordRequired'),
      passwordMismatch: t('auth.errors.passwordMismatch'),
      phoneAlreadyRegistered: t('auth.errors.phoneAlreadyRegistered'),
      genericError: t('auth.errors.genericError'),
    },
  };
}

export default async function RegisterPage() {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);

  return (
    <RegisterPageComponent
      labels={getRegisterLabels(t)}
      locale={locale}
      headerLabels={getAuthHeaderLabels(t, locale)}
    />
  );
}
