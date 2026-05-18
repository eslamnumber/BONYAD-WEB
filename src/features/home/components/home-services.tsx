import Image from 'next/image';

import {
  FeatureConnectIcon,
  FeatureSmoothIcon,
  FeatureVerifiedIcon,
} from '@/components/icons';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type HomeServicesProps = { locale: Locale; variant?: 'user' | 'pro' };

type FeatureItemProps = {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
};

function FeatureItem({ Icon, title, body }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-1 flex-col gap-1 text-start">
        <p className="text-xl font-medium text-foreground">{title}</p>
        <p className="text-base text-muted-foreground">{body}</p>
      </div>
      <div aria-hidden className="shrink-0">
        <Icon className="size-10" />
      </div>
    </div>
  );
}

type ServicesPanelProps = { title: string; body: string; panelClass: string };

function ServicesPanel({ title, body, panelClass }: ServicesPanelProps) {
  return (
    <div className={`relative h-[467px] w-full overflow-hidden rounded-[8px] backdrop-blur-[60px] md:w-[518px] md:shrink-0 ${panelClass}`}>
      <Image
        src="/images/services/right-panel-bg.webp"
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 518px"
      />
      <div className="absolute end-[28px] top-[39px] flex max-w-[280px] flex-col gap-3 text-start">
        <h3 className="text-[36px] font-semibold leading-tight text-foreground">{title}</h3>
        <p className="text-[20px] text-foreground/80">{body}</p>
      </div>
    </div>
  );
}

export function HomeServices({ locale, variant = 'user' }: HomeServicesProps) {
  const { t } = getTranslations(locale);

  const ns = variant === 'pro' ? 'tech' : 'home';
  const panelClass = variant === 'pro' ? 'bg-tech-services-panel' : 'bg-services-panel';

  return (
    <section className="relative overflow-hidden bg-background py-20">
      {/* Ellipse 31 — bottom-start blob */}
      <div aria-hidden className="pointer-events-none absolute bottom-8 start-16 h-[295px] w-[276px] rounded-full bg-deco-blob-blue-light opacity-40 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <h2 className="text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            {t(`${ns}.services.headline`)}
          </h2>
          <p className="max-w-xl text-lg text-foreground/80">{t(`${ns}.services.subheadline`)}</p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex h-auto flex-col justify-center gap-[45px] rounded-[8px] border border-border bg-white/40 p-8 backdrop-blur-[100px] md:h-[467px] md:flex-1">
            <FeatureItem
              Icon={FeatureVerifiedIcon}
              title={t('home.services.feature1Title')}
              body={t('home.services.feature1Body')}
            />
            <FeatureItem
              Icon={FeatureSmoothIcon}
              title={t('home.services.feature2Title')}
              body={t('home.services.feature2Body')}
            />
            <FeatureItem
              Icon={FeatureConnectIcon}
              title={t('home.services.feature3Title')}
              body={t('home.services.feature3Body')}
            />
          </div>
          <ServicesPanel
            title={t(`${ns}.services.ctaCardTitle`)}
            body={t(`${ns}.services.ctaCardBody`)}
            panelClass={panelClass}
          />
        </div>
      </div>
    </section>
  );
}
