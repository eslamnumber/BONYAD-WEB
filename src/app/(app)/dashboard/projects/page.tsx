import type { Metadata } from 'next';

import {
  CustomerProjectsView,
  DashboardSearch,
  ProjectStatCards,
  ProjectsEmptyState,
  ProjectsView,
} from '@/features/dashboard';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';
import { getServerUser } from '@/lib/server-auth';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('dashboard.projects.title'), robots: { index: false, follow: false } };
}

/**
 * "Projects" tab — role-branched on the single shared `/dashboard/projects` route.
 * Technicians see their assigned work (SP view, `/projects/my-assigned`); every
 * other role (the customer) sees their own requested projects (Figma 1394:8107,
 * `/projects/my`) with KPI cards, a status filter, and a price/date sort menu.
 * The `(app)` layout supplies the sidebar + <main>; the sidebar's Projects item
 * activates on this path for both roles.
 */
export default async function ProjectsPage() {
  const [user, locale] = await Promise.all([getServerUser(), getServerLocale()]);
  const isTechnician = (user?.role ?? '').toUpperCase() === 'TECHNICIAN';

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Decorative navy glow (Figma "Ellipse 27", blurred). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-[486px] opacity-[0.06] [background:radial-gradient(60%_60%_at_50%_30%,var(--color-brand-dark-navy),transparent_70%)] lg:block"
      />
      <DashboardSearch />
      {isTechnician ? (
        <>
          <ProjectStatCards />
          <ProjectsView emptyState={<ProjectsEmptyState locale={locale} />} />
        </>
      ) : (
        <CustomerProjectsView />
      )}
    </div>
  );
}
