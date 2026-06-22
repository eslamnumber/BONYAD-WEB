import type { Metadata } from 'next';

import { SupervisionScreen } from '@/features/dashboard';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('dashboard.supervision.title'), robots: { index: false, follow: false } };
}

/**
 * Supervision hub (`/dashboard/supervision`, technician-only) — Invitations + Active
 * tabs of the projects this technician supervises (PROJECTS.SUPERVISING). Thin RSC
 * shell; the tabbed UI + accept/decline live in the {@link SupervisionScreen} client
 * island. The `(app)` layout supplies the sidebar + `<main>`; the sidebar's
 * Supervision item (technician nav only) activates on this path. Private → `noindex`.
 */
export default function SupervisionPage() {
  return <SupervisionScreen />;
}
