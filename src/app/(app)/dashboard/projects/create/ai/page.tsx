import type { Metadata } from 'next';

import { OmdahInterview } from '@/features/dashboard';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return {
    title: t('dashboard.createProject.ai.metaTitle'),
    robots: { index: false, follow: false },
  };
}

/**
 * Omdah AI Q&A interview (Figma 1583:2747) — reached from the method picker's AI row.
 * A local, guided 7-question interview; SOW generation is the "later" work. The `(app)`
 * layout supplies the sidebar + <main>; this is a thin shell around the client screen.
 */
export default function OmdahInterviewPage() {
  return <OmdahInterview />;
}
