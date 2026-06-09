import Link from 'next/link';

import { APP_STORE_LINKS } from '@/config/constants';

const BADGE_HEIGHT = {
  lg: 'h-12',
  sm: 'h-9',
  xs: 'h-7',
} as const;

const FOCUS_RING =
  'rounded-[9px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

const INTERACTIVE =
  'transition-transform duration-200 will-change-transform motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-105 motion-safe:active:scale-95';

type StoreBadgesProps = {
  appStoreAlt: string;
  googlePlayAlt: string;
  size?: keyof typeof BADGE_HEIGHT;
  interactive?: boolean;
  className?: string;
};

/**
 * Official App Store + Google Play badges (brand assets in public/images/store).
 * Text-bearing graphics — intentionally NOT mirrored in RTL. See docs/i18n-and-rtl.md §Visuals.
 * `interactive` adds a subtle lift/scale on hover + tap (used by the compact mobile bar).
 */
export function StoreBadges({
  appStoreAlt,
  googlePlayAlt,
  size = 'lg',
  interactive = false,
  className,
}: StoreBadgesProps) {
  const height = BADGE_HEIGHT[size];
  const linkClass = `${FOCUS_RING} ${interactive ? INTERACTIVE : ''}`;
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ''}`}>
      <Link
        href={APP_STORE_LINKS.ios}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/store/app-store-badge.svg"
          alt={appStoreAlt}
          className={`${height} w-auto`}
        />
      </Link>
      <Link
        href={APP_STORE_LINKS.android}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/store/google-play-badge.svg"
          alt={googlePlayAlt}
          className={`${height} w-auto`}
        />
      </Link>
    </div>
  );
}
