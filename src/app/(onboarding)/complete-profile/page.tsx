import { type Metadata } from 'next';

import { CompleteProfileScreen } from '@/features/onboarding';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return {
    title: t('onboarding.completeProfile.pageTitle'),
    robots: { index: false, follow: false },
  };
}

export default function CompleteProfilePage() {
  return <CompleteProfileScreen />;
}
