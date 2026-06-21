import { type Metadata } from 'next';

import { WaitingApprovalScreen } from '@/features/onboarding';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return {
    title: t('onboarding.waitingApproval.pageTitle'),
    robots: { index: false, follow: false },
  };
}

export default function WaitingApprovalPage() {
  return <WaitingApprovalScreen />;
}
