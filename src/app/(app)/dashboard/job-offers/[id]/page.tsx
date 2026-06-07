import type { Metadata } from 'next';

import { JobOfferDetail } from '@/features/dashboard';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('dashboard.jobOffer.title'), robots: { index: false, follow: false } };
}

type PageProps = { params: Promise<{ id: string }> };

/**
 * Project / job-offer detail (Figma "Dashboard-SP (Project Detail)"). The (app)
 * layout supplies the sidebar + <main>; this fills the content column. Data is
 * client-fetched via TanStack Query inside <JobOfferDetail> (authenticated, noindex).
 */
export default async function JobOfferDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <JobOfferDetail projectId={Number(id)} />;
}
