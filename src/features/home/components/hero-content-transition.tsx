'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

type HeroContentTransitionProps = {
  children: ReactNode;
};

export function HeroContentTransition({ children }: HeroContentTransitionProps) {
  return (
    <motion.div
      className="flex w-full flex-col items-center gap-6"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
