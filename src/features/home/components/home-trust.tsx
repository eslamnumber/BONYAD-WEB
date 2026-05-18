import Image from 'next/image';

import { TrustSupportIcon } from '@/components/icons';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type HomeTrustProps = { locale: Locale };

type WorkerColumnProps = { stat: string; body: string };

function WorkerColumn({ stat, body }: WorkerColumnProps) {
  return (
    <div className="relative h-[559px] w-[301px] shrink-0 overflow-hidden rounded-[8px]">
      <Image src="/images/trust/worker.webp" alt="" fill className="object-cover" sizes="301px" />
      <div className="absolute bottom-0 end-0 start-0 h-[218px] rounded-b-[4px] bg-background/60 backdrop-blur-[30px]">
        <div className="flex h-full flex-col items-start justify-center gap-3 px-6 text-start">
          <p className="text-[45px] font-semibold leading-none text-foreground">{stat}</p>
          <p className="text-sm text-foreground/80">{body}</p>
        </div>
      </div>
    </div>
  );
}

type BentoLeftProps = {
  stat120: string; stat120Body: string;
  contractTitle: string; contractBody: string;
  supportTitle: string; supportBody: string;
  transparentTitle: string; transparentBody: string;
};

function BentoLeft({ stat120, stat120Body, contractTitle, contractBody, supportTitle, supportBody, transparentTitle, transparentBody }: BentoLeftProps) {
  return (
    <div className="flex w-[847px] shrink-0 flex-wrap gap-x-[14px] gap-y-[11px]">
      <div className="flex h-[228px] w-[264px] flex-col items-center justify-center gap-4 rounded-[8px] bg-brand-navy p-6 text-center">
        <p className="text-6xl font-medium text-white">{stat120}</p>
        <p className="text-sm leading-relaxed text-white/90">{stat120Body}</p>
      </div>

      <div className="relative h-[228px] w-[568px] overflow-hidden rounded-[8px] bg-trust-bg-light">
        <div aria-hidden className="absolute -start-4 top-4 h-full w-[260px] -rotate-12 overflow-hidden">
          <Image src="/images/trust/contract.webp" alt="" fill className="object-contain object-top" sizes="260px" />
        </div>
        <div className="absolute end-[24px] top-1/2 flex max-w-[260px] -translate-y-1/2 flex-col gap-2 text-start">
          <h3 className="text-xl font-semibold text-foreground">{contractTitle}</h3>
          <p className="text-sm text-muted-foreground">{contractBody}</p>
        </div>
      </div>

      <div className="flex h-[320px] w-[511px] flex-col items-start justify-center gap-5 rounded-[8px] bg-trust-bg-light p-8">
        <TrustSupportIcon className="h-[71px] w-[64px] shrink-0" aria-hidden />
        <div className="flex flex-col gap-3 text-start">
          <h3 className="text-[36px] font-semibold leading-tight text-foreground">{supportTitle}</h3>
          <p className="text-base text-muted-foreground">{supportBody}</p>
        </div>
      </div>

      <div className="flex h-[320px] w-[322px] flex-col items-center justify-center gap-4 rounded-[8px] bg-trust-blue-mid p-8 text-center">
        <h3 className="text-xl font-semibold text-white">{transparentTitle}</h3>
        <p className="text-sm leading-relaxed text-white/90">{transparentBody}</p>
      </div>
    </div>
  );
}

export function HomeTrust({ locale }: HomeTrustProps) {
  const { t } = getTranslations(locale);

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <h2 className="text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            {t('home.trust.headline')}
          </h2>
          <p className="text-lg text-foreground/80">{t('home.trust.subheadline')}</p>
        </div>

        <div className="flex justify-center overflow-x-auto">
          <div className="flex gap-[14px]">
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
            <WorkerColumn
              stat={t('home.trust.stat100')}
              body={t('home.trust.stat100Body')}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
