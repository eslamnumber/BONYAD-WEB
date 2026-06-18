import Link from 'next/link';

import { ChevronLeftIcon } from '@/components/icons';

/**
 * Soft brand glow behind a settings detail screen (Payment cards / Portfolio / My
 * info / Account type …) — one quiet signature moment, desktop-gated so it can never
 * cause horizontal scroll on phones, dark-safe (the token has a `.dark` pair), centred
 * so no mirror flip is needed. Shared chrome so every settings sub-screen matches.
 */
export function SettingsAmbientGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 hidden justify-center overflow-hidden lg:flex"
    >
      <div className="bg-deco-blob-blue-light mt-[-120px] h-[380px] w-[560px] rounded-full opacity-20 blur-[110px]" />
    </div>
  );
}

/** Back link to the profile hub — chevron flips via `ltr:-scale-x-100` (a back arrow). */
export function SettingsBackLink({ href, label }: { href: string; label: string }) {
  return (
    <nav className="flex w-full items-center justify-end">
      <Link
        href={href}
        className="text-brand-dark-navy focus-visible:outline-ring inline-flex items-center gap-2 rounded text-sm font-semibold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:hover:opacity-80"
      >
        {label}
        <ChevronLeftIcon className="size-3 shrink-0 ltr:-scale-x-100" aria-hidden />
      </Link>
    </nav>
  );
}
