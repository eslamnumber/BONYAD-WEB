import type { Metadata } from 'next';

import { CreateProjectWizard } from '@/features/dashboard';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return {
    title: t('dashboard.createProject.metaTitle'),
    robots: { index: false, follow: false },
  };
}

/**
 * "Create a new project" — the customer's multi-step project-creation wizard
 * (Figma 1394:7041…). The `(app)` layout supplies the sidebar + <main>; this page
 * is a thin shell around the client wizard, which owns the step state, the
 * per-step forms, and the final create→phases submit (`useSubmitNewProject`).
 */
export default function CreateProjectPage() {
  return (
    <div className="relative flex w-full flex-1 flex-col px-4 py-8 sm:px-6">
      <CreateProjectWizard />
    </div>
  );
}
