'use client';

import Link from 'next/link';

import { ChevronLeftIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { conventionalDirection, type Locale } from '@/types/locale';

/**
 * Back-to-profile link in **conventional direction** (this screen overrides the inverted map,
 * so the shared `SettingsBackLink` — tuned for the inverted map — would point the wrong way).
 * Chevron leads at the reading-start and points back; the flip is computed from
 * `conventionalDirection` (a `ltr:`/`rtl:` variant would track the inverted `<html dir>` and
 * misfire under this screen's local `dir` override).
 */
export function BackLink({ label, locale }: { label: string; locale: Locale }) {
  return (
    <nav className="flex w-full items-center justify-start">
      <Link
        href={ROUTES.DASHBOARD_SETTINGS}
        className="text-brand-dark-navy focus-visible:outline-ring inline-flex items-center gap-2 rounded text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-80"
      >
        <ChevronLeftIcon
          className={`size-3 shrink-0 ${conventionalDirection(locale) === 'rtl' ? '-scale-x-100' : ''}`}
          aria-hidden
        />
        {label}
      </Link>
    </nav>
  );
}
