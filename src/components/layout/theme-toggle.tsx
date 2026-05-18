'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/button';

type ThemeToggleProps = {
  /** Localized aria-label. */
  ariaLabel: string;
  /** Localized labels for the announced state. */
  labels: { light: string; dark: string; system: string };
};

// React 19 idiom for SSR hydration detection — no `useEffect + setState`.
// Server snapshot returns false, client snapshot returns true; the value flips
// once on hydration. The store never changes, so subscribe is a no-op and the
// returned unsubscribe is intentionally inert.
const noop = () => undefined;
const subscribe = () => noop;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

/**
 * Cycles theme: light → dark → system → light.
 * Renders sun/moon based on the resolved theme.
 *
 * Hydration-safe via `useSyncExternalStore`: server-rendered HTML matches the
 * pre-hydration client render exactly.
 */
export function ThemeToggle({ ariaLabel, labels }: ThemeToggleProps) {
  const hydrated = useIsHydrated();
  const { theme, setTheme, resolvedTheme } = useTheme();

  if (!hydrated) {
    return <span className="inline-block size-10" aria-hidden />;
  }

  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
  const announce =
    theme === 'system' ? labels.system : resolvedTheme === 'dark' ? labels.dark : labels.light;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={ariaLabel}
      title={announce}
      onClick={() => setTheme(next)}
    >
      <ThemeGlyph theme={resolvedTheme ?? 'light'} />
    </Button>
  );
}

function ThemeGlyph({ theme }: { theme: string }) {
  if (theme === 'dark') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
