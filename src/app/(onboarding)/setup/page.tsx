import { type Metadata } from 'next';

import { TechnicianSetupScreen } from '@/features/onboarding';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return {
    title: t('onboarding.setup.pageTitle'),
    robots: { index: false, follow: false },
  };
}

export default function TechnicianSetupPage() {
  return <TechnicianSetupScreen />;
}
