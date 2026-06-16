import type { Metadata } from 'next';

import { ProjectEdit } from '@/features/dashboard';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return {
    title: t('dashboard.projectEdit.title'),
    robots: { index: false, follow: false },
  };
}

type PageProps = { params: Promise<{ id: string }> };

/**
 * Customer project-edit route (RN OwnerProjectEditScreen). The (app) layout
 * supplies the sidebar + <main>; this fills the content column. Data is
 * client-fetched via TanStack Query inside <ProjectEdit> (authenticated, noindex):
 * GET /projects/:id/owner-edit to load, PUT to save. Reached from the customer
 * "Edit project" action on the pending-project detail.
 */
export default async function ProjectEditPage({ params }: PageProps) {
  const { id } = await params;
  return <ProjectEdit projectId={Number(id)} />;
}
