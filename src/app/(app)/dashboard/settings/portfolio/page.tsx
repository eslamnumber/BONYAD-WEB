import type { Metadata } from 'next';

import { PortfolioScreen } from '@/features/portfolio';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('portfolio.title'), robots: { index: false, follow: false } };
}

/**
 * Technician portfolio screen (`/dashboard/settings/portfolio`) — the target of the
 * profile hub's "My portfolio" row (technician-only). Thin RSC shell; the create /
 * manage / project-CRUD UI lives in the {@link PortfolioScreen} client island (reads
 * the live portfolio + projects via TanStack Query). Private surface, so `noindex`.
 */
export default function PortfolioPage() {
  return <PortfolioScreen />;
}
