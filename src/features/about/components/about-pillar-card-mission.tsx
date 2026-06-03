import { AboutPillarMissionIcon } from '@/components/icons';
import {
  PillarBlobBottom,
  PillarBlobTop,
  PillarMissionIllustration,
} from '@/components/illustrations';
import { type Locale } from '@/types/locale';

import { AboutPillarCardShell } from './about-pillar-card-shell';

/**
 * Figma 515:5001 — Mission card.
 * Behind-frost layers (revealed on hover):
 *   - 515:5147 top decorative blob   (Figma h:278 w:477 left:-18 top:-84) — same as Value
 *   - 515:5134 wavy line + dot marker (Figma 373.5×214 box, rotated 156.31° + flipped on Y,
 *     framed in a 428×346 box at left:135 top:22)
 *   - 515:5022 bottom decorative blob (resolves to start:-17 top:-83 in card coords; mix-blend-overlay)
 * The wave illustration stays anchored to the RIGHT of the card in BOTH locales
 * (ltr:start + rtl:end both resolve to physical left:135, and the >card-width box
 * overflows so its centered content lands on the right). In en the swoosh is
 * rotated 180° (rtl:rotate-180) rather than mirrored — reads as a clean arch and
 * keeps en visually distinct from the ar wave. See docs/i18n-and-rtl.md §Visuals.
 */
export function AboutPillarCardMission({ locale }: { locale: Locale }) {
  return (
    <AboutPillarCardShell
      locale={locale}
      Icon={AboutPillarMissionIcon}
      titleKey="about.pillars.mission.title"
      bodyKey="about.pillars.mission.body"
      decoration={
        <>
          <PillarBlobTop className="text-pillar-blob absolute start-[-18px] -top-[84px] h-[278px] w-[477px] rtl:-scale-x-100" />
          <div className="absolute top-[22px] flex h-[346px] w-[428px] items-center justify-center ltr:start-[135px] rtl:end-[135px] rtl:rotate-180">
            <div className="flex-none -scale-y-100 rotate-[156.31deg]">
              <PillarMissionIllustration className="h-[214px] w-[373.5px]" />
            </div>
          </div>
          <PillarBlobBottom className="absolute start-[-17px] -top-[83px] h-[203px] w-[477px] mix-blend-overlay rtl:-scale-x-100" />
        </>
      }
    />
  );
}
