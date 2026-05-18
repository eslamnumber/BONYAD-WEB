import Link from 'next/link';

import { TechCtaWave } from '@/components/illustrations';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type HomeStartCtaProps = { locale: Locale; variant?: 'user' | 'pro' };

function UserCta({ headline, body, ctaPrimary, ctaSecondary }: {
  headline: string;
  body: string;
  ctaPrimary: string;
  ctaSecondary: string;
}) {
  return (
    <section className="relative bg-background py-16">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            aria-hidden
            src="/images/hero/cta-bg.svg"
            alt=""
            className="pointer-events-none absolute inset-x-[30px] top-[25px] h-[317px] max-w-none"
          />
          <div className="relative flex min-h-[367px] items-center justify-center overflow-hidden rounded-[16px] border border-border bg-[rgba(249,249,249,0.2)] px-8 py-12 backdrop-blur-[140px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              aria-hidden
              src="/images/hero/cta-deco.svg"
              alt=""
              width={408}
              height={467}
              className="pointer-events-none absolute top-[19px] start-[-118px] h-[467px] w-[408px] max-w-none"
            />
            <div className="relative flex w-full max-w-[656px] flex-col items-center gap-6 text-center">
              <h2 className="text-[45px] font-medium leading-tight text-foreground">{headline}</h2>
              <p className="max-w-[533px] text-[24px] leading-snug text-foreground">{body}</p>
              <div className="flex flex-wrap items-center justify-center gap-[18px]">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full border border-foreground bg-transparent px-4 text-[16px] font-bold text-foreground hover:bg-foreground/5"
                >
                  <Link href={ROUTES.SERVICES}>{ctaSecondary}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-brand-navy px-4 text-[16px] font-bold text-white hover:bg-brand-navy/90"
                >
                  <Link href={ROUTES.REGISTER}>{ctaPrimary}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Tech CTA — Figma node 1:4864 ("Call To Action Background").
 *
 * Card is 1280×367 in Figma. We translate Figma's pixel coordinates to logical
 * CSS so the wave anchors to the inline-start side in both LTR and RTL.
 *
 *  - Wave (Vector 14): inset top 15.26% / inline-end 45.2% / bottom -15.26% /
 *    inline-start -0.23%. Figma flips the wave horizontally (`-scale-x-100`);
 *    the source SVG already carries the linear gradient + 2px stroke.
 *  - Earnings pill: top 52, inline-start 236 (anchored over a wave peak).
 *  - Ellipse marker: top 87, inline-start 330 (the dot above the pill).
 *  - Content block: width 656, centered vertically, offset 250px toward the
 *    inline-end side — sits on the end half of the card with text-end alignment.
 */
function ProCta({ headline, body, ctaPrimary, badge }: {
  headline: string;
  body: string;
  ctaPrimary: string;
  badge: string;
}) {
  return (
    <section className="relative overflow-hidden bg-background py-16">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="relative h-[367px] overflow-hidden rounded-[16px] border border-[#eaeaea] bg-[oklch(0.985_0.002_240/.2)] backdrop-blur-[140px]">
          {/* Wave — Figma 1:4870, mirrored along the inline axis */}
          <div
            aria-hidden
            className="pointer-events-none absolute -scale-x-100"
            style={{
              top: '15.26%',
              bottom: '-15.26%',
              insetInlineStart: '-0.23%',
              insetInlineEnd: '45.2%',
            }}
          >
            <TechCtaWave className="size-full" preserveAspectRatio="none" />
          </div>

          {/* Ellipse marker — Figma 1:4871 */}
          <span
            aria-hidden
            className="absolute start-[330px] top-[87px] size-[18px] rounded-full bg-brand-navy"
          />

          {/* Earnings pill — Figma 1:4872 */}
          <div className="absolute start-[236px] top-[52px] flex items-center rounded-full border-2 border-[#005DAC] bg-white/60 px-4 py-[10px] backdrop-blur-[10px]">
            <span className="whitespace-nowrap text-[12px] text-foreground" dir="rtl">
              {badge}
            </span>
          </div>

          {/* Content — Figma 1:4865 */}
          <div className="absolute end-[64px] top-1/2 flex w-[656px] -translate-y-1/2 flex-col items-end gap-6 text-end">
            <h2 className="w-full text-[45px] font-medium leading-tight text-foreground">{headline}</h2>
            <p className="w-[533px] text-[24px] leading-snug text-foreground">{body}</p>
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-brand-navy px-4 text-[16px] font-bold text-white hover:bg-brand-navy/90"
            >
              <Link href={ROUTES.REGISTER}>{ctaPrimary}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeStartCta({ locale, variant = 'user' }: HomeStartCtaProps) {
  const { t } = getTranslations(locale);

  if (variant === 'pro') {
    return (
      <ProCta
        headline={t('tech.cta.headline')}
        body={t('tech.cta.body')}
        ctaPrimary={t('tech.cta.cta')}
        badge={t('tech.cta.badge')}
      />
    );
  }

  return (
    <UserCta
      headline={t('home.startCta.headline')}
      body={t('home.startCta.body')}
      ctaPrimary={t('home.startCta.cta')}
      ctaSecondary={t('home.startCta.ctaSecondary')}
    />
  );
}
