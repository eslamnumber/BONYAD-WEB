import { type Metadata } from 'next';

import {
  getAuthHeaderLabels,
  ResetPasswordPage as ResetPasswordPageComponent,
} from '@/features/auth';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return {
    title: t('auth.resetPassword.pageTitle'),
    description: t('auth.resetPassword.metaDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function ResetPasswordRoutePage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string; role?: string }>;
}) {
  const [locale, params] = await Promise.all([getServerLocale(), searchParams]);
  const { t } = getTranslations(locale);
  const phone = params.phone ?? '';
  const role = params.role === 'TECHNICIAN' ? 'TECHNICIAN' : 'USER';

  const k = 'auth.resetPassword';
  const labels = {
    heading: t(`${k}.heading`),
    subheading: t(`${k}.subheading`),
    otpLabel: t(`${k}.otpLabel`),
    otpAriaLabel: t(`${k}.otpAriaLabel`),
    newPasswordLabel: t(`${k}.newPasswordLabel`),
    newPasswordPlaceholder: t(`${k}.newPasswordPlaceholder`),
    newPasswordAriaLabel: t(`${k}.newPasswordAriaLabel`),
    confirmPasswordLabel: t(`${k}.confirmPasswordLabel`),
    confirmPasswordPlaceholder: t(`${k}.confirmPasswordPlaceholder`),
    confirmPasswordAriaLabel: t(`${k}.confirmPasswordAriaLabel`),
    showPassword: t(`${k}.showPassword`),
    hidePassword: t(`${k}.hidePassword`),
    submitButton: t(`${k}.submitButton`),
    didNotReceiveCode: t(`${k}.didNotReceiveCode`),
    resendCode: t(`${k}.resendCode`),
    resendAriaLabel: t(`${k}.resendAriaLabel`),
    successMessage: t(`${k}.successMessage`),
    backToLogin: t(`${k}.backToLogin`),
    headingBrand: t('site.name'),
    errors: { genericError: t('auth.errors.genericError') },
  };

  return (
    <ResetPasswordPageComponent
      labels={labels}
      phone={phone}
      accountRole={role}
      locale={locale}
      headerLabels={getAuthHeaderLabels(t, locale)}
    />
  );
}
