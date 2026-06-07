'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

type PageTransitionProps = { children: ReactNode };

/**
 * Enter animation for authenticated `(app)` screens. Keyed on the pathname so
 * each navigation (dashboard → messages → notifications → …) remounts the
 * subtree and replays a fade + upward slide. Timing mirrors the motion tokens
 * (`--motion-base` / ease-out-quint). Reduced motion is honored globally via
 * `<MotionConfig reducedMotion="user">` in providers — the opacity fade stays,
 * the transform is dropped.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto"
    >
      {children}
    </motion.div>
  );
}
