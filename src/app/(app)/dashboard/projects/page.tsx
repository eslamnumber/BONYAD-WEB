import type { Metadata } from 'next';

import {
  DashboardSearch,
  ProjectStatCards,
  ProjectsEmptyState,
  ProjectsView,
} from '@/features/dashboard';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('dashboard.projects.title'), robots: { index: false, follow: false } };
}

/**
 * Service-provider "Projects" tab. The `(app)` layout supplies the sidebar +
 * <main>; the sidebar's Projects item activates automatically on this path.
 * Renders the zero-state only (Figma "Dashboard-SP (Projects) (Empty State)") —
 * the populated my-assigned list + its fetch land with that design.
 */
export default async function ProjectsPage() {
  const locale = await getServerLocale();

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Decorative navy glow (Figma "Ellipse 27", blurred). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-[486px] opacity-[0.06] [background:radial-gradient(60%_60%_at_50%_30%,var(--color-brand-dark-navy),transparent_70%)] lg:block"
      />
      <DashboardSearch />
      <ProjectStatCards />
      <ProjectsView emptyState={<ProjectsEmptyState locale={locale} />} />
    </div>
  );
}
