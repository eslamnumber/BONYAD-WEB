import Link from 'next/link';

import { APP_STORE_LINKS } from '@/config/constants';

const BADGE_HEIGHT = {
  lg: 'h-12',
  sm: 'h-9',
} as const;

const FOCUS_RING =
  'rounded-[9px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

type StoreBadgesProps = {
  appStoreAlt: string;
  googlePlayAlt: string;
  size?: keyof typeof BADGE_HEIGHT;
  className?: string;
};

/**
 * Official App Store + Google Play badges (brand assets in public/images/store).
 * Text-bearing graphics — intentionally NOT mirrored in RTL. See docs/i18n-and-rtl.md §Visuals.
 */
export function StoreBadges({
  appStoreAlt,
  googlePlayAlt,
  size = 'lg',
  className,
}: StoreBadgesProps) {
  const height = BADGE_HEIGHT[size];
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ''}`}>
      <Link
        href={APP_STORE_LINKS.ios}
        target="_blank"
        rel="noopener noreferrer"
        className={FOCUS_RING}
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
        className={FOCUS_RING}
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
