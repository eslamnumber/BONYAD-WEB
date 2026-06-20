import { CustomerLandingBackdrop } from './customer-landing-backdrop';
import { CustomerSearch } from './customer-search';
import { CustomerWelcomeHero } from './customer-welcome-hero';

/**
 * Customer (USER role) dashboard landing — Figma "Dashboard-User(Landing)"
 * (node 1394:6486). The `(app)` layout supplies the role-aware sidebar + <main>;
 * this fills the content column with a glass search bar, the welcome hero, and the
 * shared landing backdrop (navy glow + city skyline). `min-h-full` makes the short
 * landing fill the viewport so the skyline sits at the bottom edge.
 */
export function CustomerDashboard() {
  return (
    <div className="relative isolate flex min-h-full w-full flex-col gap-12 px-4 py-8 sm:px-6">
      <CustomerLandingBackdrop />
      <CustomerSearch />
      <CustomerWelcomeHero />
    </div>
  );
}
