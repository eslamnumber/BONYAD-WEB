import Image from 'next/image';

import { TrustSupportIcon } from '@/components/icons';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type HomeTrustProps = { locale: Locale };

type WorkerColumnProps = { stat: string; body: string };

function WorkerColumn({ stat, body }: WorkerColumnProps) {
  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-[8px] sm:h-[559px] lg:w-[301px] lg:shrink-0">
      <Image
        src="/images/trust/worker.webp"
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 301px"
      />
      <div className="bg-background/60 absolute start-0 end-0 bottom-0 h-[180px] rounded-b-[4px] backdrop-blur-[30px] sm:h-[218px]">
        <div className="flex h-full flex-col items-end justify-center gap-3 px-6 text-end">
          <p className="text-foreground text-4xl leading-none font-semibold sm:text-[45px]">
            {stat}
          </p>
          <p className="text-foreground/80 text-sm">{body}</p>
        </div>
      </div>
    </div>
  );
}

function StatTopCell({ stat, body }: { stat: string; body: string }) {
  return (
    <div className="bg-brand-navy flex min-h-[180px] flex-col items-center justify-center gap-4 rounded-[8px] p-6 text-center sm:col-span-2 sm:min-h-[228px]">
      <p className="text-5xl font-medium text-white sm:text-6xl">{stat}</p>
      <p className="text-sm leading-relaxed text-white/90">{body}</p>
    </div>
  );
}

function TransparentCell({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-trust-blue-mid flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-[8px] p-6 text-center sm:col-span-2 sm:min-h-[320px] sm:p-8">
      <h3 className="text-lg font-semibold text-white sm:text-xl">{title}</h3>
      <p className="text-sm leading-relaxed text-white/90">{body}</p>
    </div>
  );
}

type BentoLeftProps = {
  stat120: string;
  stat120Body: string;
  contractTitle: string;
  contractBody: string;
  supportTitle: string;
  supportBody: string;
  transparentTitle: string;
  transparentBody: string;
};

function BentoLeft({
  stat120,
  stat120Body,
  contractTitle,
  contractBody,
  supportTitle,
  supportBody,
  transparentTitle,
  transparentBody,
}: BentoLeftProps) {
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-6 lg:w-[847px] lg:shrink-0">
      <StatTopCell stat={stat120} body={stat120Body} />

      <div className="bg-trust-bg-light relative min-h-[200px] overflow-hidden rounded-[8px] sm:col-span-4 sm:min-h-[228px]">
        <div
          aria-hidden
          className="absolute -start-4 top-4 h-full w-[260px] -rotate-12 overflow-hidden"
        >
          <Image
            src="/images/trust/contract.webp"
            alt=""
            fill
            className="object-contain object-top"
            sizes="260px"
          />
        </div>
        <div className="absolute end-[16px] top-1/2 flex max-w-[260px] -translate-y-1/2 flex-col gap-2 text-end sm:end-[24px]">
          <h3 className="text-foreground text-lg font-semibold sm:text-xl">{contractTitle}</h3>
          <p className="text-muted-foreground text-sm">{contractBody}</p>
        </div>
      </div>

      <div className="bg-trust-bg-light flex min-h-[260px] flex-col items-end justify-center gap-5 rounded-[8px] p-6 sm:col-span-4 sm:min-h-[320px] sm:p-8">
        <TrustSupportIcon
          className="h-[57px] w-[52px] shrink-0 sm:h-[71px] sm:w-[64px]"
          aria-hidden
        />
        <div className="flex flex-col gap-3 text-end">
          <h3 className="text-foreground text-2xl leading-tight font-semibold sm:text-3xl lg:text-[36px]">
            {supportTitle}
          </h3>
          <p className="text-muted-foreground text-base">{supportBody}</p>
        </div>
      </div>

      <TransparentCell title={transparentTitle} body={transparentBody} />
    </div>
  );
}

export function HomeTrust({ locale }: HomeTrustProps) {
  const { t } = getTranslations(locale);

  return (
    <section className="bg-background py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-12">
          <h2 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
            {t('home.trust.headline')}
          </h2>
          <p className="text-foreground/80 text-base sm:text-lg">{t('home.trust.subheadline')}</p>
        </div>

        <div className="flex justify-center">
          <div className="flex w-full flex-col gap-[14px] lg:flex-row">
            <BentoLeft
              stat120={t('home.trust.stat120')}
              stat120Body={t('home.trust.stat120Body')}
              contractTitle={t('home.trust.contractTitle')}
              contractBody={t('home.trust.contractBody')}
              supportTitle={t('home.trust.supportTitle')}
              supportBody={t('home.trust.supportBody')}
              transparentTitle={t('home.trust.transparentTitle')}
              transparentBody={t('home.trust.transparentBody')}
            />
            <WorkerColumn stat={t('home.trust.stat100')} body={t('home.trust.stat100Body')} />
          </div>
        </div>
      </div>
    </section>
  );
}
