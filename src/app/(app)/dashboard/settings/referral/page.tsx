import type { Metadata } from 'next';

import { ReferralScreen } from '@/features/referral';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('referral.title'), robots: { index: false, follow: false } };
}

/**
 * Refer & earn (`/dashboard/settings/referral`) — the target of the profile hub's
 * "Refer & earn" row (both roles). Thin RSC shell; the live wallet / funnel / invite /
 * referral-list flow lives in the {@link ReferralScreen} client island. Private
 * surface, so `noindex`.
 */
export default function ReferralPage() {
  return <ReferralScreen />;
}
