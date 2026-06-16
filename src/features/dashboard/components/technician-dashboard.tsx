import { DashboardHero } from './dashboard-hero';
import { DashboardSearch } from './dashboard-search';
import { JobOffersSection } from './job-offers-section';
import { ProjectCarousel } from './project-carousel';

/**
 * Service-provider (technician) dashboard landing content. Extracted from the
 * `/dashboard` route so the page can branch by role — customers (USER) get
 * {@link CustomerDashboard} instead. The `(app)` layout supplies the sidebar +
 * <main> landmark; this fills the content column.
 */
export function TechnicianDashboard() {
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
