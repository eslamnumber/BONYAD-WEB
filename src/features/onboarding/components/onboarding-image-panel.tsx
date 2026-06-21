'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

import { LogoIcon } from '@/components/icons';

/**
 * Desktop hero panel — the same login artwork + token-driven gradient blend as the auth
 * screens, so onboarding reads as a continuation of sign-up. Hidden below `lg`. The
 * gradient direction swaps with `--blend-to-form` (set per `<html dir>`).
 *
 * Pinned to the viewport (`lg:sticky lg:top-0 lg:h-dvh lg:self-start`) so a tall step body —
 * the setup wizard's expanding service accordions — no longer stretches the panel and snaps
 * the `object-cover` crop. In its place the photo carries a slow, continuous zoom in/out
 * (reduced-motion-safe), so the artwork feels alive instead of jumping on each interaction.
 */
export function OnboardingImagePanel() {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  return (
    <div className="relative hidden overflow-hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-1 lg:self-start">
      <motion.div
        className="absolute inset-0"
        animate={reduce ? undefined : { scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image
          src="/images/login/bg.png"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </motion.div>
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background: 'linear-gradient(var(--blend-to-form), var(--login-bg) 0%, transparent 40%)',
        }}
      />
      <div className="absolute end-0 top-0 z-10 flex h-[78px] items-center pe-8">
        <LogoIcon className="h-10 w-auto" aria-hidden />
        <span className="sr-only">{t('site.name')}</span>
      </div>
    </div>
  );
}
