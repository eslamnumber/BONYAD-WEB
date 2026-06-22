import type { Metadata } from 'next';

import { ServicesScreen } from '@/features/services';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('services.title'), robots: { index: false, follow: false } };
}

/**
 * Available Services (`/dashboard/settings/services`) — the target of the profile
 * hub's technician-only "Services" row. Displays the services the technician offers
 * and their subscription status. Thin RSC shell; the role-aware UI + the live services
 * fetching live in the {@link ServicesScreen} client island. Private surface, so `noindex`.
 */
export default function ServicesPage() {
  return <ServicesScreen />;
}
