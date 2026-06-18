import type { Metadata } from 'next';

import { SubscriptionScreen } from '@/features/subscriptions';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('subscription.title'), robots: { index: false, follow: false } };
}

/**
 * My Subscriptions (`/dashboard/settings/subscriptions`) — the target of the profile
 * hub's technician-only "My subscriptions" row (iOS `SubscriptionManagementView`).
 * Thin RSC shell; the role-aware UI + the live subscription/bid-quota/cancel flow
 * live in the {@link SubscriptionScreen} client island. Private surface, so `noindex`.
 */
export default function SubscriptionsPage() {
  return <SubscriptionScreen />;
}
