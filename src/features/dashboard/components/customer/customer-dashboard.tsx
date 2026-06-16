import Image from 'next/image';

import { CustomerSearch } from './customer-search';
import { CustomerWelcomeHero } from './customer-welcome-hero';

/**
 * Customer (USER role) dashboard landing — Figma "Dashboard-User(Landing)"
 * (node 1394:6486). The `(app)` layout supplies the role-aware sidebar + <main>;
 * this fills the content column with a glass search bar, the welcome hero, and two
 * decorative backdrops: a soft navy glow behind the search ("Ellipse 27") and the
 * city skyline anchored to the bottom-start (left in ar, right in en). `min-h-full` makes the short landing
 * fill the viewport so the skyline sits at the bottom edge.
 */
export function CustomerDashboard() {
  return (
    <div className="relative isolate mx-auto flex min-h-full w-full max-w-6xl flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8">
      <CustomerLandingBackdrop />
      <CustomerSearch />
      <CustomerWelcomeHero />
    </div>
  );
}

/**
 * Decorative background layers (Figma "Ellipse 27" 1394:6509 + skyline 1394:6488).
 * Clipped to the content column, pointer-inert, behind everything (-z-10). The
 * skyline is desktop-only (hardcoded size), mirrors with the locale, and inverts
 * in dark mode so its white backdrop blends into the dark surface.
 */
function CustomerLandingBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[34rem] opacity-25 [background:radial-gradient(60%_55%_at_50%_6%,var(--color-brand-dark-navy),transparent_62%)]" />
      <Image
        src="/images/bg/customer-dashboard-skyline.png"
        alt=""
        width={1264}
        height={712}
        sizes="770px"
        className="absolute start-0 bottom-0 hidden h-[414px] w-[770px] max-w-none object-cover select-none lg:block rtl:-scale-x-100 dark:opacity-70 dark:invert"
      />
    </div>
  );
}
