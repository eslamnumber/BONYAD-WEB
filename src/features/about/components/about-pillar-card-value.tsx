import { AboutPillarValueIcon } from '@/components/icons';
import {
  PillarBlobBottom,
  PillarBlobTop,
  PillarValueIllustration,
} from '@/components/illustrations';
import { type Locale } from '@/types/locale';

import { AboutPillarCardShell } from './about-pillar-card-shell';

/**
 * Figma 515:5158 — Value card.
 * Behind-frost layers (revealed on hover):
 *   - 515:5159 top decorative blob   (Figma h:278 w:477 start:-18 top:-84, fill-opacity 0.4)
 *   - 515:5237 grid + dots artwork   (Figma h:690 w:514 start:-55 top:-16)
 *   - 515:5176 bottom decorative blob (Figma h:203 w:477 inside content frame at top:-123 — resolves to ~start:-17 top:-83 in card coords; mix-blend-overlay)
 * All positions use logical `start-*` so the artwork mirrors with locale direction.
 */
export function AboutPillarCardValue({ locale }: { locale: Locale }) {
  return (
    <AboutPillarCardShell
      locale={locale}
      Icon={AboutPillarValueIcon}
      titleKey="about.pillars.value.title"
      bodyKey="about.pillars.value.body"
      decoration={
        <>
          <PillarBlobTop className="text-pillar-blob absolute start-[-18px] -top-[84px] h-[278px] w-[477px]" />
          <PillarValueIllustration className="absolute start-[-55px] -top-4 h-[690px] w-[514px]" />
          <PillarBlobBottom className="absolute start-[-17px] -top-[83px] h-[203px] w-[477px] mix-blend-overlay" />
        </>
      }
    />
  );
}
