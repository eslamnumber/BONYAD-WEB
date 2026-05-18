'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Announces route changes to screen readers.
 *
 * App Router does NOT move focus or announce page changes when navigating
 * between routes — assistive-tech users land on a "new" page silently. This
 * component listens for pathname changes and writes the new `document.title`
 * into a polite live region.
 *
 * Mount once in `src/app/layout.tsx`. Render is a single visually-hidden div.
 */
export function RouteAnnouncer() {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = document.title;
    }
  }, [pathname]);

  return <div ref={ref} role="status" aria-live="polite" aria-atomic="true" className="sr-only" />;
}
