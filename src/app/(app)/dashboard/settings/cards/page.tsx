import type { Metadata } from 'next';

import { CardManagementScreen } from '@/features/cards';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('cards.title'), robots: { index: false, follow: false } };
}

/**
 * Payment-cards screen (`/dashboard/settings/cards`) — the target of the profile
 * hub's "Payment cards" row (iOS Account → CardManagementView). Thin RSC shell; the
 * role-aware UI + the HyperPay add-card flow live in the {@link CardManagementScreen}
 * client island (reads the hydrated session). Private surface, so `noindex`.
 */
export default function CardsPage() {
  return <CardManagementScreen />;
}
