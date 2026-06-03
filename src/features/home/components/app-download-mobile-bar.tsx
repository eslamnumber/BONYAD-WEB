'use client';

import { X } from 'lucide-react';
import { useSyncExternalStore } from 'react';

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
 * App-download bar shown on small screens only (md:hidden), sticky directly below the
 * top header (which is `sticky top-0` and 72px tall — hence `top-[72px]`).
 * Dismissal persists in localStorage so it doesn't nag on repeat visits. The server
 * snapshot is "dismissed" so SSR + hydration render nothing, then the client reveals it.
 */
export function AppDownloadMobileBar({
  title,
  appStoreAlt,
  googlePlayAlt,
  dismissLabel,
}: AppDownloadMobileBarProps) {
  const dismissed = useSyncExternalStore(subscribe, isDismissed, () => true);

  if (dismissed) return null;

  return (
    <div className="border-border bg-card/95 sticky top-[72px] z-40 border-b backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2">
        <p dir="auto" className="text-foreground text-start text-sm font-semibold">
          {title}
        </p>
        <div className="flex items-center gap-2">
          <StoreBadges size="sm" appStoreAlt={appStoreAlt} googlePlayAlt={googlePlayAlt} />
          <button
            type="button"
            onClick={dismiss}
            aria-label={dismissLabel}
            className="text-muted-foreground hover:text-foreground focus-visible:outline-ring rounded-full p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
