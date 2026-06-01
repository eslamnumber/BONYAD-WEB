import Image from 'next/image';

import { AboutPillarVisionIcon } from '@/components/icons';
import { PillarVisionBlobNavy, PillarVisionBlobWhite } from '@/components/illustrations';
import { type Locale } from '@/types/locale';

import { AboutPillarCardShell } from './about-pillar-card-shell';

/**
 * Figma 515:4925 — Vision card.
 * Behind-frost layers (revealed on hover):
 *   - 515:5197 full-bleed photo (1200×900; Figma w:163.93% left:-31.96% = object-cover center)
 *   - 515:4924 top glow blob    (resolves to start:-21 top:-73 in card coords; mix-blend-overlay,
 *     tinted with --color-deco-blob-blue-light so the top band reads as a soft light blue)
 *   - 515:5342 white glow blob  (resolves to start:-21 top:260 in card coords; mix-blend-overlay)
 * Positions use logical `start-*` so the artwork mirrors with locale direction.
 * Dark mode: the bright photo would bleed through the near-clear dark frost, so a
 * card-tinted scrim (dark-only) darkens it to read as a dark surface like the V/M cards.
 */
export function AboutPillarCardVision({ locale }: { locale: Locale }) {
  return (
    <AboutPillarCardShell
      locale={locale}
      Icon={AboutPillarVisionIcon}
      titleKey="about.pillars.vision.title"
      bodyKey="about.pillars.vision.body"
      decoration={
        <>
          <Image
            src="/images/bg/about-pillar-vision.jpg"
            alt=""
            fill
            sizes="(min-width: 640px) 414px, 100vw"
            className="object-cover"
          />
          <PillarVisionBlobWhite className="absolute start-[-21px] top-[260px] h-[371px] w-[477px] mix-blend-overlay" />
          <PillarVisionBlobNavy className="text-deco-blob-blue-light absolute start-[-21px] -top-[73px] h-[265px] w-[477px] mix-blend-overlay" />
          <div aria-hidden className="bg-card absolute inset-0 hidden opacity-[0.88] dark:block" />
        </>
      }
    />
  );
}
