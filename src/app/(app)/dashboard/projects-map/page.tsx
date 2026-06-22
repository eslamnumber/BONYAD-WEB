import type { Metadata } from 'next';

import { ProjectsMapScreen } from '@/features/projects-map';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return {
    title: t('projectsMap.title'),
    robots: { index: false, follow: false },
  };
}

export default function ProjectsMapPage() {
  return <ProjectsMapScreen />;
}
