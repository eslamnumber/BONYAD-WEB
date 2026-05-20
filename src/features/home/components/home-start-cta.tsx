import Link from 'next/link';

import { TechCtaWave } from '@/components/illustrations';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type HomeStartCtaProps = { locale: Locale; variant?: 'user' | 'pro' };

function UserCtaButtons({
  ctaPrimary,
  ctaSecondary,
}: {
  ctaPrimary: string;
  ctaSecondary: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-[18px]">
      <Button
        asChild
        size="lg"
        className="border-foreground text-foreground hover:bg-foreground/5 h-12 rounded-full border bg-transparent px-4 text-[16px] font-bold"
      >
        <Link href={ROUTES.SERVICES}>{ctaSecondary}</Link>
      </Button>
      <Button
        asChild
        size="lg"
        className="bg-brand-navy hover:bg-brand-navy/90 h-12 rounded-full px-4 text-[16px] font-bold text-white"
      >
        <Link href={ROUTES.REGISTER}>{ctaPrimary}</Link>
      </Button>
    </div>
  );
}

function UserCta({
  headline,
  body,
  ctaPrimary,
  ctaSecondary,
}: {
  headline: string;
  body: string;
  ctaPrimary: string;
  ctaSecondary: string;
}) {
  return (
    <section className="bg-background relative py-12 sm:py-16">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            aria-hidden
            src="/images/hero/cta-bg.svg"
            alt=""
            className="pointer-events-none absolute inset-x-[30px] top-[25px] hidden h-[317px] max-w-none md:block"
          />
          <div className="border-border bg-card/20 relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-[16px] border px-4 py-10 backdrop-blur-[140px] sm:px-8 sm:py-12 md:min-h-[367px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              aria-hidden
              src="/images/hero/cta-deco.svg"
              alt=""
              width={408}
              height={467}
              className="pointer-events-none absolute start-[-118px] top-[19px] hidden h-[467px] w-[408px] max-w-none md:block"
            />
            <div className="relative flex w-full max-w-[656px] flex-col items-center gap-6 text-center">
              <h2 className="text-foreground text-2xl leading-tight font-medium sm:text-3xl md:text-4xl lg:text-[45px]">
                {headline}
              </h2>
              <p className="text-foreground max-w-[533px] text-base leading-snug sm:text-lg md:text-xl lg:text-[24px]">
                {body}
              </p>
              <UserCtaButtons ctaPrimary={ctaPrimary} ctaSecondary={ctaSecondary} />
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
 *  - Content block: width 656, centered vertically, offset 64px from the
 *    inline-end side — sits on the end half of the card with text-end alignment.
 *
 * Source order: content block FIRST, decoration AFTER. Below `xl` the absolute
 * layout collapses; the single-item content column must lead so it isn't
 * pushed below the wave on narrow viewports. The decoration (wave + pill +
 * marker) only renders at `xl` (1280px), where the viewport matches the
 * Figma frame width — at smaller widths the absolute coordinates would
 * overlap the content. See docs/responsive-design.md §Stacking order for
 * asymmetric columns.
 */
function ProCtaDecoration({ badge }: { badge: string }) {
  return (
    <>
      {/* Wave — Figma 1:4870; visible from md up since it uses % positioning */}
      <div
        aria-hidden
        className="pointer-events-none absolute hidden -scale-x-100 md:block"
        style={{
          top: '15.26%',
          bottom: '-15.26%',
          insetInlineStart: '-0.23%',
          insetInlineEnd: '45.2%',
        }}
      >
        <TechCtaWave className="size-full" preserveAspectRatio="none" />
      </div>
      {/* Ellipse + Earnings pill — only at xl */}
      <span
        aria-hidden
        className="bg-brand-navy absolute start-[330px] top-[87px] hidden size-[18px] rounded-full xl:block"
      />
      <div className="border-brand-navy bg-card/60 absolute start-[236px] top-[52px] hidden items-center rounded-full border-2 px-4 py-[10px] backdrop-blur-[10px] xl:flex">
        <span className="text-foreground text-[12px] whitespace-nowrap">{badge}</span>
      </div>
    </>
  );
}

function ProCtaContent({
  headline,
  body,
  ctaPrimary,
}: {
  headline: string;
  body: string;
  ctaPrimary: string;
}) {
  return (
    <div className="relative z-10 ms-auto flex w-full max-w-[656px] flex-col items-end gap-6 text-end xl:absolute xl:end-[64px] xl:top-1/2 xl:-translate-y-1/2">
      <h2 className="text-foreground w-full text-3xl leading-tight font-medium sm:text-4xl xl:text-[45px]">
        {headline}
      </h2>
      <p className="text-foreground w-full max-w-[533px] text-lg leading-snug sm:text-xl xl:text-[24px]">
        {body}
      </p>
      <Button
        asChild
        size="lg"
        className="bg-brand-navy hover:bg-brand-navy/90 h-12 rounded-full px-4 text-[16px] font-bold text-white"
      >
        <Link href={ROUTES.REGISTER}>{ctaPrimary}</Link>
      </Button>
    </div>
  );
}

function ProCta({
  headline,
  body,
  ctaPrimary,
  badge,
}: {
  headline: string;
  body: string;
  ctaPrimary: string;
  badge: string;
}) {
  return (
    <section className="bg-background relative overflow-hidden py-12 sm:py-16">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            aria-hidden
            src="/images/hero/cta-bg.svg"
            alt=""
            className="pointer-events-none absolute inset-x-[30px] top-[25px] hidden h-[317px] max-w-none md:block"
          />
          <div className="border-border bg-card/20 relative min-h-[320px] overflow-hidden rounded-[16px] border px-6 py-10 backdrop-blur-[140px] sm:px-10 xl:h-[367px] xl:py-0">
            <ProCtaContent headline={headline} body={body} ctaPrimary={ctaPrimary} />
            <ProCtaDecoration badge={badge} />
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
