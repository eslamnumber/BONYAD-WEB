import Image from 'next/image';

/**
 * Decorative background for the customer landing family (Figma "Ellipse 27"
 * 1394:6509 / 1574:2407 + skyline 1394:6488 / 1659:1641). Clipped to the content
 * column, pointer-inert, behind everything (-z-10). A soft navy glow sits behind
 * the search bar; the city skyline anchors to the bottom-start (left in ar, right
 * in en). The skyline is desktop-only (hardcoded size), mirrors with the locale,
 * and inverts in dark mode so its white backdrop blends into the dark surface.
 * Shared by the dashboard landing and the create-project chooser (Figma 1574:2384).
 */
export function CustomerLandingBackdrop() {
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
