'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

import { ROUTES } from '@/config/routes';

type HeroContentTransitionProps = {
  children: ReactNode;
};

export function HeroContentTransition({ children }: HeroContentTransitionProps) {
  const pathname = usePathname();
  const animKey = pathname === ROUTES.FOR_PROS ? 'pro' : 'user';

  return (
    <motion.div
      key={animKey}
      className="flex w-full flex-col items-center gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
