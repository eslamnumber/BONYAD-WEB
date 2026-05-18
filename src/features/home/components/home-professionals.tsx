import Image from 'next/image';

import { DetailLocationIcon, DetailProjectsIcon, DetailRateIcon } from '@/components/icons';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type HomeProfessionalsProps = { locale: Locale };

type ProfessionalData = {
  imgSrc: string;
  nameKey: string;
  titleKey: string;
  rateKey: string;
  projectsKey: string;
  locationKey: string;
};

const PROFESSIONALS: ProfessionalData[] = [
  {
    imgSrc: '/images/technicians/card-1.webp',
    nameKey: 'home.professionals.pro1Name',
    titleKey: 'home.professionals.pro1Title',
    rateKey: 'home.professionals.pro1Rate',
    projectsKey: 'home.professionals.pro1Projects',
    locationKey: 'home.professionals.pro1Location',
  },
  {
    imgSrc: '/images/technicians/card-2.webp',
    nameKey: 'home.professionals.pro2Name',
    titleKey: 'home.professionals.pro2Title',
    rateKey: 'home.professionals.pro2Rate',
    projectsKey: 'home.professionals.pro2Projects',
    locationKey: 'home.professionals.pro2Location',
  },
  {
    imgSrc: '/images/technicians/card-3.webp',
    nameKey: 'home.professionals.pro3Name',
    titleKey: 'home.professionals.pro3Title',
    rateKey: 'home.professionals.pro3Rate',
    projectsKey: 'home.professionals.pro3Projects',
    locationKey: 'home.professionals.pro3Location',
  },
];

type ProfCardProps = {
  imgSrc: string;
  name: string;
  title: string;
  rate: string;
  projects: string;
  location: string;
  verifiedLabel: string;
};

function ProfCard({ imgSrc, name, title, rate, projects, location, verifiedLabel }: ProfCardProps) {
  return (
    <div className="group relative h-[460px] w-full shrink-0 overflow-hidden rounded sm:w-[378px]">
      <Image
        src={imgSrc}
        alt={name}
        fill
        className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, 378px"
      />
      <div className="absolute end-0 top-[22px] bg-success px-4 py-2">
        <span className="text-sm font-medium leading-none text-white">{verifiedLabel}</span>
      </div>
      <div className="absolute start-[20px] top-[298px] h-[142px] w-[338px] overflow-hidden rounded-[8px] bg-slate-50/80 p-4 backdrop-blur-[10px]">
        <div className="flex flex-col gap-1 text-start">
          <p className="text-[32px] font-medium leading-tight text-foreground">{name}</p>
          <p className="text-[16px] font-semibold text-foreground/60">{title}</p>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <DetailRateIcon className="size-4 shrink-0" aria-hidden />
              <span>{rate}</span>
            </div>
            <div aria-hidden className="h-[26px] w-px bg-brand-navy opacity-60" />
            <div className="flex items-center gap-1">
              <DetailProjectsIcon className="size-4 shrink-0" aria-hidden />
              <span>{projects}</span>
            </div>
            <div aria-hidden className="h-[26px] w-px bg-brand-navy opacity-60" />
            <div className="flex items-center gap-1">
              <DetailLocationIcon className="size-4 shrink-0" aria-hidden />
              <span>{location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeProfessionals({ locale }: HomeProfessionalsProps) {
  const { t } = getTranslations(locale);

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <h2 className="text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            {t('home.professionals.headline')}
          </h2>
          <p className="text-lg text-foreground/80">{t('home.professionals.subheadline')}</p>
        </div>
        <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-center">
          {PROFESSIONALS.map((pro) => (
            <ProfCard
              key={pro.imgSrc}
              imgSrc={pro.imgSrc}
              name={t(pro.nameKey)}
              title={t(pro.titleKey)}
              rate={t(pro.rateKey)}
              projects={t(pro.projectsKey)}
              location={t(pro.locationKey)}
              verifiedLabel={t('home.professionals.verified')}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
