import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import {
  Step1Icon,
  Step2Icon,
  Step3Icon,
  Step4Icon,
} from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type HomeHowItWorksProps = { locale: Locale; variant?: 'user' | 'pro' };

type StepCardProps = {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
};

function StepCard({ Icon, title, body }: StepCardProps) {
  return (
    <div className="flex h-[221px] w-[318px] shrink-0 flex-col justify-between rounded-[16px] border border-service-border bg-white/60 px-6 py-6 backdrop-blur-[4px]">
      <div aria-hidden className="flex justify-end text-primary">
        <Icon className="size-9" />
      </div>
      <div className="flex flex-col gap-3 text-start">
        <p className="text-xl font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

export function HomeHowItWorks({ locale, variant = 'user' }: HomeHowItWorksProps) {
  const { t } = getTranslations(locale);

  const ns = variant === 'pro' ? 'tech' : 'home';

  const steps: StepCardProps[] = [
    { Icon: Step1Icon, title: t(`${ns}.howItWorks.step1Title`), body: t(`${ns}.howItWorks.step1Body`) },
    { Icon: Step2Icon, title: t(`${ns}.howItWorks.step2Title`), body: t(`${ns}.howItWorks.step2Body`) },
    { Icon: Step3Icon, title: t(`${ns}.howItWorks.step3Title`), body: t(`${ns}.howItWorks.step3Body`) },
    { Icon: Step4Icon, title: t(`${ns}.howItWorks.step4Title`), body: t(`${ns}.howItWorks.step4Body`) },
  ];

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[12px] bg-white py-12">
          {/* Background blob decorations */}
          <div aria-hidden className="pointer-events-none absolute end-0 top-16 h-[310px] w-[608px] rounded-full bg-deco-blob-blue-light opacity-50 blur-[100px]" />
          <div aria-hidden className="pointer-events-none absolute start-0 top-24 h-[230px] w-[453px] rounded-full bg-deco-blob-blue-light opacity-50 blur-[100px]" />

          {/* Content */}
          <div className="relative flex flex-col items-center gap-8 px-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-4xl font-medium tracking-tight text-foreground md:text-5xl">
                {t(`${ns}.howItWorks.headline`)}
              </h2>
              <p className="max-w-lg text-lg text-foreground/80">
                {t(`${ns}.howItWorks.subheadline`)}
              </p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none]">
              {steps.map((step) => (
                <StepCard key={step.title} Icon={step.Icon} title={step.title} body={step.body} />
              ))}
            </div>

            <Link
              href={ROUTES.SERVICES}
              className="flex items-center gap-2 rounded-full border border-brand-navy px-6 py-2.5 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-navy/5"
            >
              {t(`${ns}.howItWorks.learnMore`)}
              <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
