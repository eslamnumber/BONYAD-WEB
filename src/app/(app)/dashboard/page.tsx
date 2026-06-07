import type { Metadata } from 'next';

import {
  DashboardHero,
  DashboardSearch,
  JobOffersSection,
  ProjectCarousel,
} from '@/features/dashboard';
import { getTranslations } from '@/lib/get-translations';
import { getServerLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  return { title: t('dashboard.title'), robots: { index: false, follow: false } };
}

/**
 * Service-provider dashboard landing. The `(app)` layout supplies the right-hand
 * sidebar + the <main> landmark; this page fills the content column. Sections are
 * added one Phase-5 sub-phase at a time: search bar → hero + featured project
 * carousel → job-offer tabs + list. Backend-driven sections fetch available
 * projects via `useAvailableProjects` (from `@/features/dashboard`) in their own
 * 'use client' leaf — the page itself stays a Server Component.
 */
export default function DashboardPage() {
  return (
    <div className="relative isolate mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8">
      {/* Decorative navy glow behind the search/hero/carousel (Figma "Ellipse 27",
          a heavily-blurred #003867 ellipse — inlined as a soft radial). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] opacity-25 [background:radial-gradient(60%_55%_at_50%_6%,var(--color-brand-dark-navy),transparent_62%)]"
      />
      <DashboardSearch />
      <DashboardHero />
      <ProjectCarousel />
      <JobOffersSection />
    </div>
  );
}
