import {
  DetailLocationIcon,
  DetailProjectsIcon,
  DetailRateIcon,
  PersonIcon,
} from '@/components/icons';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type HomeProfessionalsProps = { locale: Locale };

type ProfessionalData = {
  nameKey: string;
  titleKey: string;
  rateKey: string;
  projectsKey: string;
  locationKey: string;
};

const PROFESSIONALS: ProfessionalData[] = [
  {
    nameKey: 'home.professionals.pro1Name',
    titleKey: 'home.professionals.pro1Title',
    rateKey: 'home.professionals.pro1Rate',
    projectsKey: 'home.professionals.pro1Projects',
    locationKey: 'home.professionals.pro1Location',
  },
  {
    nameKey: 'home.professionals.pro2Name',
    titleKey: 'home.professionals.pro2Title',
    rateKey: 'home.professionals.pro2Rate',
    projectsKey: 'home.professionals.pro2Projects',
    locationKey: 'home.professionals.pro2Location',
  },
  {
    nameKey: 'home.professionals.pro3Name',
    titleKey: 'home.professionals.pro3Title',
    rateKey: 'home.professionals.pro3Rate',
    projectsKey: 'home.professionals.pro3Projects',
    locationKey: 'home.professionals.pro3Location',
  },
];

type ProfCardProps = {
  name: string;
  title: string;
  rate: string;
  projects: string;
  location: string;
  verifiedLabel: string;
};

function ProfCard({ name, title, rate, projects, location, verifiedLabel }: ProfCardProps) {
  return (
    <div className="group bg-muted relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded sm:h-[460px]">
      <div className="bg-muted-foreground/15 flex size-28 items-center justify-center overflow-hidden rounded-full transition-transform duration-300 motion-safe:group-hover:scale-105 sm:size-32">
        <PersonIcon aria-hidden className="text-muted-foreground/70 size-16 sm:size-20" />
      </div>
      <div className="bg-success absolute end-0 top-[22px] px-4 py-2">
        <span className="text-sm leading-none font-medium text-white">{verifiedLabel}</span>
      </div>
      <div className="absolute inset-x-4 bottom-4 overflow-hidden rounded-[8px] bg-slate-50/80 p-3 backdrop-blur-[10px] sm:p-4">
        <div className="flex flex-col gap-1 text-end">
          <p className="text-foreground text-2xl leading-tight font-medium sm:text-[32px]">
            {name}
          </p>
          <p className="text-foreground/60 text-sm font-semibold sm:text-[16px]">{title}</p>
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <DetailRateIcon className="size-4 shrink-0" aria-hidden />
              <span>{rate}</span>
            </div>
            <div aria-hidden className="bg-brand-navy hidden h-[26px] w-px opacity-60 sm:block" />
            <div className="flex items-center gap-1">
              <DetailProjectsIcon className="size-4 shrink-0" aria-hidden />
              <span>{projects}</span>
            </div>
            <div aria-hidden className="bg-brand-navy hidden h-[26px] w-px opacity-60 sm:block" />
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
    <section className="bg-background py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-12">
          <h2 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
            {t('home.professionals.headline')}
          </h2>
          <p className="text-foreground/80 text-base sm:text-lg">
            {t('home.professionals.subheadline')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROFESSIONALS.map((pro) => (
            <ProfCard
              key={pro.nameKey}
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
