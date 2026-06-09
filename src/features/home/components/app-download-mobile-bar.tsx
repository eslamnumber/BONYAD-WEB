'use client';

import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';

import { ROUTES } from '@/config/routes';

import { StoreBadges } from './store-badges';

const DISMISS_KEY = 'bonyad-app-bar-dismissed';

let listeners: (() => void)[] = [];

function subscribe(onChange: () => void) {
  listeners.push(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners = listeners.filter((listener) => listener !== onChange);
    window.removeEventListener('storage', onChange);
  };
}

function isDismissed() {
  return localStorage.getItem(DISMISS_KEY) === '1';
}

function dismiss() {
  localStorage.setItem(DISMISS_KEY, '1');
  listeners.forEach((listener) => listener());
}

type AppDownloadMobileBarProps = {
  title: string;
  appStoreAlt: string;
  googlePlayAlt: string;
  dismissLabel: string;
};

/**
 * App-download bar shown on small screens only (md:hidden), rendered above the top
 * header so it sits at the very top of the page (home route only) and scrolls away
 * to reveal the sticky header beneath it.
 * Dismissal persists in localStorage so it doesn't nag on repeat visits. The server
 * snapshot is "dismissed" so SSR + hydration render nothing, then the client reveals it.
 */
export function AppDownloadMobileBar({
  title,
  appStoreAlt,
  googlePlayAlt,
  dismissLabel,
}: AppDownloadMobileBarProps) {
  const pathname = usePathname();
  const dismissed = useSyncExternalStore(subscribe, isDismissed, () => true);

  if (pathname !== ROUTES.HOME || dismissed) return null;

  return (
    <div className="border-border bg-card/80 border-b backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
        <button
          type="button"
          onClick={dismiss}
          aria-label={dismissLabel}
          className="text-muted-foreground hover:text-foreground focus-visible:outline-ring shrink-0 rounded-full p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <X className="size-4" aria-hidden />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
          <StoreBadges
            size="xs"
            interactive
            className="shrink-0 flex-nowrap gap-2"
            appStoreAlt={appStoreAlt}
            googlePlayAlt={googlePlayAlt}
          />
          <p className="text-foreground min-w-0 truncate text-end text-sm font-semibold">{title}</p>
        </div>
      </div>
    </div>
  );
}
