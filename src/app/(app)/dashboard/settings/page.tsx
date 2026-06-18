import type { Metadata } from 'next';

import { ProfileScreen } from '@/features/profile';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('profile.title'), robots: { index: false, follow: false } };
}

/**
 * Profile / account hub — the target of the sidebar gear nav item (both roles)
 * and the customer profile-card menu. Thin RSC shell; the role-aware UI lives in
 * the {@link ProfileScreen} client island (reads the hydrated session + the live
 * profile via TanStack Query). Private surface, so `noindex`.
 */
export default function SettingsPage() {
  return <ProfileScreen />;
}
