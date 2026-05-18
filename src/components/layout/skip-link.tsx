type SkipLinkProps = {
  /** Localized "Skip to main content" label. */
  label: string;
  /** Anchor target — defaults to `#main`. */
  href?: string;
};

/**
 * First focusable element on the page. Invisible until focused.
 * Lets keyboard users jump past the header to the main landmark.
 * (WCAG 2.4.1 Bypass Blocks.)
 */
export function SkipLink({ label, href = '#main' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="focus:bg-primary focus:text-primary-foreground focus:ring-ring sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none"
    >
      {label}
    </a>
  );
}
