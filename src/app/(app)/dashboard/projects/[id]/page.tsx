import type { Metadata } from 'next';

import { AssignedProjectDetail } from '@/features/dashboard';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return {
    title: t('dashboard.projectDetail.title'),
    robots: { index: false, follow: false },
  };
}

type PageProps = { params: Promise<{ id: string }> };

/**
 * Assigned-project detail (Figma "Dashboard-SP (Project detail)"). The (app)
 * layout supplies the sidebar + <main>; this fills the content column. Data is
 * client-fetched via TanStack Query inside <AssignedProjectDetail> (authenticated,
 * noindex), which dispatches by lifecycle status: completed → CompletedProjectDetail
 * (1103:6757), otherwise the in-progress execution view (1103:6593). Bid-phase
 * projects use the separate /dashboard/job-offers/[id] route.
 */
export default async function AssignedProjectPage({ params }: PageProps) {
  const { id } = await params;
  return <AssignedProjectDetail projectId={Number(id)} />;
}
