import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { Step1Icon, Step2Icon, Step3Icon, Step4Icon } from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type HomeHowItWorksProps = { locale: Locale; variant?: 'user' | 'pro' };

type BuildStepsArg = ReturnType<typeof getTranslations>['t'];

function buildSteps(t: BuildStepsArg, ns: string): StepCardProps[] {
  return [
    {
      Icon: Step1Icon,
      title: t(`${ns}.howItWorks.step1Title`),
      body: t(`${ns}.howItWorks.step1Body`),
    },
    {
      Icon: Step2Icon,
      title: t(`${ns}.howItWorks.step2Title`),
      body: t(`${ns}.howItWorks.step2Body`),
    },
    {
      Icon: Step3Icon,
      title: t(`${ns}.howItWorks.step3Title`),
      body: t(`${ns}.howItWorks.step3Body`),
    },
    {
      Icon: Step4Icon,
      title: t(`${ns}.howItWorks.step4Title`),
      body: t(`${ns}.howItWorks.step4Body`),
    },
  ];
}

type StepCardProps = {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
};

function StepCard({ Icon, title, body }: StepCardProps) {
  return (
    <div className="border-service-border flex h-[221px] w-[318px] shrink-0 flex-col gap-8 rounded-[16px] border bg-white/60 ps-5 pe-[41px] pt-[31px] pb-8 backdrop-blur-[4px]">
      <div aria-hidden className="text-primary flex justify-end">
        <span className="block size-9">
          <Icon width={36} height={36} />
        </span>
      </div>
      <div className="flex flex-col gap-4 text-end">
        <p className="text-foreground text-2xl font-medium">{title}</p>
        <p className="text-muted-foreground text-base">{body}</p>
      </div>
    </div>
  );
}

export function HomeHowItWorks({ locale, variant = 'user' }: HomeHowItWorksProps) {
  const { t } = getTranslations(locale);
  const ns = variant === 'pro' ? 'tech' : 'home';
  const steps = buildSteps(t, ns);

  return (
    <section className="bg-background py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="bg-card relative rounded-[12px] px-4 py-10 sm:px-8 sm:py-12">
          {/* Blob layer has its own overflow-hidden so it doesn't clip the scroll row */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[12px]"
          >
            <div className="bg-deco-blob-blue-light absolute end-0 top-16 hidden h-[310px] w-[608px] rounded-full opacity-50 blur-[100px] sm:block" />
            <div className="bg-deco-blob-blue-light absolute start-0 top-24 hidden h-[230px] w-[453px] rounded-full opacity-50 blur-[100px] sm:block" />
          </div>

          {/* Content */}
          <div className="relative flex flex-col items-center gap-10">
            <div className="flex max-w-[509px] flex-col items-center gap-4 text-center">
              <h2 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl lg:text-[50px]">
                {t(`${ns}.howItWorks.headline`)}
              </h2>
              <p className="text-foreground/80 text-base sm:text-lg lg:text-xl">
                {t(`${ns}.howItWorks.subheadline`)}
              </p>
            </div>

            <div className="flex w-full [scrollbar-width:none] gap-2 overflow-x-auto pb-2">
              {steps.map((step) => (
                <StepCard key={step.title} Icon={step.Icon} title={step.title} body={step.body} />
              ))}
            </div>

            <Link
              href={ROUTES.SERVICES}
              className="text-foreground/80 flex items-center gap-2 rounded-full border border-black/80 px-4 py-2.5 text-sm font-bold tracking-[0.1px] transition-colors hover:bg-black/5"
            >
              {t(`${ns}.howItWorks.learnMore`)}
              <ChevronRight className="size-5 ltr:-scale-x-100" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
