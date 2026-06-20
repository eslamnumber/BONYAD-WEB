'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { LOCALE_DIRECTION, type Locale } from '@/types/locale';

type PageTransitionProps = { children: ReactNode };

/** How far the screen slides in from the panel edge, in px. */
const SLIDE_PX = 40;

/**
 * Enter animation for authenticated `(app)` screens. Keyed on the pathname so
 * each navigation (dashboard → messages → notifications → …) remounts the
 * subtree and replays a fade + a short slide in from the sidebar (panel) edge —
 * the content settles in from the inline-end side where the dashboard sidebar
 * sits. framer-motion's `x` is a raw physical transform, so the sign is mirrored
 * under RTL via `LOCALE_DIRECTION` (same pattern as HeroToggle): inline-end is
 * physically left in English (rtl) and right in Arabic (ltr). The transient
 * horizontal overflow is clipped by the `<main>` scroll container
 * (`overflow-x-clip`). Reduced motion is honored globally via
 * `<MotionConfig reducedMotion="user">` in providers — the opacity fade stays,
 * the transform is dropped.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const { i18n } = useTranslation();
  const locale: Locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const fromX = LOCALE_DIRECTION[locale] === 'rtl' ? -SLIDE_PX : SLIDE_PX;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, x: fromX }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto"
    >
      {children}
    </motion.div>
  );
}
