import type { Metadata } from 'next';

import { SupportScreen } from '@/features/support';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('support.title'), robots: { index: false, follow: false } };
}

/**
 * Support center (`/dashboard/settings/support`) — the target of the profile hub's
 * "Support center" row (both roles). Thin RSC shell; the interactive ticket UI lives
 * in the {@link SupportScreen} client island. Private surface, so `noindex`.
 */
export default function SupportPage() {
  return <SupportScreen />;
}
