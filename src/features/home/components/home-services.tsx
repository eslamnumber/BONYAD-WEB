import Image from 'next/image';

import { FeatureConnectIcon, FeatureSmoothIcon, FeatureVerifiedIcon } from '@/components/icons';
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
    <div className="flex items-center justify-end gap-4">
      <div className="flex flex-col gap-1 text-end">
        <p className="text-foreground text-xl font-medium">{title}</p>
        <p className="text-muted-foreground text-base">{body}</p>
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
    <div
      className={`relative min-h-[320px] w-full overflow-hidden rounded-[8px] backdrop-blur-[60px] sm:min-h-[400px] lg:h-[467px] lg:w-[518px] lg:shrink-0 ${panelClass}`}
    >
      <Image
        src="/images/services/right-panel-bg.webp"
        alt=""
        fill
        className="object-cover dark:opacity-25"
        sizes="(max-width: 768px) 100vw, 518px"
      />
      <div className="absolute start-6 top-8 flex max-w-[280px] flex-col gap-3 text-start sm:start-[28px] sm:top-[39px]">
        <h3 className="text-foreground text-2xl leading-tight font-semibold sm:text-3xl md:text-[36px]">
          {title}
        </h3>
        <p className="text-foreground/80 text-base sm:text-lg md:text-[20px]">{body}</p>
      </div>
    </div>
  );
}

export function HomeServices({ locale, variant = 'user' }: HomeServicesProps) {
  const { t } = getTranslations(locale);

  const ns = variant === 'pro' ? 'tech' : 'home';
  const panelClass = variant === 'pro' ? 'bg-tech-services-panel' : 'bg-services-panel';

  return (
    <section className="bg-background relative overflow-hidden py-12 sm:py-16 lg:py-20">
      {/* Ellipse 31 — bottom-start blob (hidden on mobile to reduce visual noise) */}
      <div
        aria-hidden
        className="bg-deco-blob-blue-light pointer-events-none absolute start-16 bottom-8 hidden h-[295px] w-[276px] rounded-full opacity-40 blur-[100px] sm:block"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col items-center gap-4 text-center sm:mb-16">
          <h2 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
            {t(`${ns}.services.headline`)}
          </h2>
          <p className="text-foreground/80 max-w-xl text-base sm:text-lg">
            {t(`${ns}.services.subheadline`)}
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="border-border bg-card/40 flex h-auto flex-col justify-center gap-8 rounded-[8px] border p-6 backdrop-blur-[100px] sm:gap-[45px] sm:p-8 lg:h-[467px] lg:flex-1">
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
