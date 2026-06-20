import type { Metadata } from 'next';

import { CreateProjectChooser } from '@/features/dashboard';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return {
    title: t('dashboard.createProject.chooser.metaTitle'),
    robots: { index: false, follow: false },
  };
}

/**
 * "Create a request" chooser (Figma 1574:2384) — the launcher reached from the
 * customer dashboard "start a project" CTA. Presents the four creation methods;
 * "New project" routes on to the manual wizard at `/dashboard/projects/new`. The
 * `(app)` layout supplies the sidebar + <main>; this is a thin shell.
 */
export default function CreateProjectChooserPage() {
  return <CreateProjectChooser />;
}
