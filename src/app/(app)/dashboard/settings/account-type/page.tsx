import type { Metadata } from 'next';

import { AccountTypeScreen } from '@/features/profile';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('profile.accountType.title'), robots: { index: false, follow: false } };
}

/**
 * Account-type screen (iOS `CompanyModeToggleView`) — switch Individual ↔ Company
 * with Wathq verification. Thin RSC shell; the interactive UI is the
 * {@link AccountTypeScreen} client island. Private surface, so `noindex`.
 */
export default function AccountTypePage() {
  return <AccountTypeScreen />;
}
