import type { Metadata } from 'next';

import { SupervisionControlPanel } from '@/features/dashboard';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('dashboard.supervision.title'), robots: { index: false, follow: false } };
}

type PageProps = { params: Promise<{ id: string }> };

/**
 * Supervisor control panel for one supervised project (`/dashboard/supervision/[id]`).
 * The `(app)` layout supplies the sidebar + `<main>`; data is client-fetched via
 * TanStack Query inside {@link SupervisionControlPanel} (authenticated, noindex).
 */
export default async function SupervisionProjectPage({ params }: PageProps) {
  const { id } = await params;
  return <SupervisionControlPanel projectId={Number(id)} />;
}
