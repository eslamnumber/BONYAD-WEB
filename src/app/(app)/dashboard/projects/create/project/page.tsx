import type { Metadata } from 'next';

import { CreateProjectMethod } from '@/features/dashboard';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return {
    title: t('dashboard.createProject.method.metaTitle'),
    robots: { index: false, follow: false },
  };
}

/**
 * "Create a project" method picker (Figma 1579:2551) — reached from the request
 * chooser's "New project" card. Offers the AI assistant (Omda, beta) and manual
 * entry; manual routes on to the wizard at `/dashboard/projects/new`. The `(app)`
 * layout supplies the sidebar + <main>; this is a thin shell.
 */
export default function CreateProjectMethodPage() {
  return <CreateProjectMethod />;
}
