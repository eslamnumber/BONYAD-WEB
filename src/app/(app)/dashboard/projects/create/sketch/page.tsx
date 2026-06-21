import type { Metadata } from 'next';

import { SketchPlanner } from '@/features/sketch';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('sketch.metaTitle') };
}

export default function SketchPlannerPage() {
  return <SketchPlanner />;
}
