import { type ComponentType, type ReactNode } from 'react';

import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type IconComponent = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

type Props = {
  locale: Locale;
  Icon: IconComponent;
  titleKey: string;
  bodyKey: string;
  /** Behind-frost layers — illustration, decorative blobs, full-bleed image, etc. */
  decoration: ReactNode;
};

/**
 * Shared shell for the V/M/V cards (Figma 515:5158 / 5001 / 4925).
 * Layers (in order, all `absolute inset-0` siblings):
 *   1. `decoration` — per-card artwork. Resting = shown BLURRED (light tint, not a white veil).
 *      On hover it zooms in (scale 1→1.10).
 *   2. Full frost — `--color-pillar-frost` + backdrop-blur; fades to opacity 0 on hover.
 *   3. Bottom frost — same frost + blur, masked to the lower half; fades IN on hover.
 *   4. Content stack — icon (top) + title + body (bottom)
 * Hover: layers 2+3 crossfade so only the TOP half exits blur mode (reveals the sharp, zoomed
 * artwork) while the BOTTOM half stays blurred for text legibility. ~400ms ease-out. Fires for
 * everyone (fades are low motion-risk; the global reduced-motion rule makes them instant).
 */
export function AboutPillarCardShell({ locale, Icon, titleKey, bodyKey, decoration }: Props) {
  const { t } = getTranslations(locale);
  return (
    <article className="group bg-card border-border relative flex min-h-[460px] w-full max-w-[414px] flex-col overflow-hidden rounded-xl border shadow-[0px_10px_21px_0px_rgba(117,117,117,0.03),0px_39px_39px_0px_rgba(117,117,117,0.02),0px_88px_53px_0px_rgba(117,117,117,0.01)] sm:min-h-[509px]">
      <div
        aria-hidden
        className="text-brand-dark-navy absolute inset-0 transition-transform duration-[400ms] ease-out group-hover:scale-110"
      >
        {decoration}
      </div>
      <div
        aria-hidden
        className="bg-pillar-frost absolute inset-0 backdrop-blur-[16px] transition-opacity duration-[400ms] ease-out group-hover:opacity-0"
      />
      <div
        aria-hidden
        className="bg-pillar-frost absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent_35%,black_60%)] opacity-0 backdrop-blur-[16px] transition-opacity duration-[400ms] ease-out [-webkit-mask-image:linear-gradient(to_bottom,transparent_35%,black_60%)] group-hover:opacity-100"
      />
      <div className="relative flex flex-1 flex-col items-end justify-between gap-8 p-10 text-start sm:px-12 sm:py-10">
        <Icon className="text-foreground size-20 shrink-0" aria-hidden />
        <div className="flex w-full flex-col items-end gap-6">
          <h3
            dir="auto"
            className="text-foreground w-full text-2xl leading-tight font-medium md:text-3xl xl:text-[32px]"
          >
            {t(titleKey)}
          </h3>
          <p
            dir="auto"
            className="text-foreground/80 w-full max-w-[315px] text-base leading-relaxed"
          >
            {t(bodyKey)}
          </p>
        </div>
      </div>
    </article>
  );
}
