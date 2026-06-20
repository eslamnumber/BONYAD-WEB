import { type Metadata } from 'next';

import { getAuthHeaderLabels, VerifyOtpPage as VerifyOtpPageComponent } from '@/features/auth';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return {
    title: t('auth.verifyOtp.pageTitle'),
    description: t('auth.verifyOtp.metaDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function VerifyOtpRoutePage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string; source?: string; role?: string; termsId?: string }>;
}) {
  const [locale, params] = await Promise.all([getServerLocale(), searchParams]);
  const { t } = getTranslations(locale);
  const phone = params.phone ?? '';
  const role = params.role === 'TECHNICIAN' ? 'TECHNICIAN' : 'USER';
  const parsedTermsId = Number.parseInt(params.termsId ?? '', 10);
  const termsId = Number.isFinite(parsedTermsId) && parsedTermsId > 0 ? parsedTermsId : undefined;

  const labels = {
    heading: t('auth.verifyOtp.heading'),
    subheading: t('auth.verifyOtp.subheading'),
    otpAriaLabel: t('auth.verifyOtp.otpAriaLabel'),
    submitButton: t('auth.verifyOtp.submitButton'),
    resendCode: t('auth.verifyOtp.resendCode'),
    resendAriaLabel: t('auth.verifyOtp.resendAriaLabel'),
    didNotReceiveCode: t('auth.verifyOtp.didNotReceiveCode'),
    roleCustomer: t('auth.register.roleCustomer'),
    roleProfessional: t('auth.register.roleProfessional'),
    roleToggleAriaLabel: t('auth.register.roleToggleAriaLabel'),
    headingBrand: t('site.name'),
    successMessage: t('auth.verifyOtp.successMessage'),
    errors: { genericError: t('auth.errors.genericError') },
  };

  return (
    <VerifyOtpPageComponent
      labels={labels}
      phone={phone}
      accountRole={role}
      termsId={termsId}
      locale={locale}
      headerLabels={getAuthHeaderLabels(t, locale)}
    />
  );
}
