import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import { HowItWorksStepsClient, type StepItem } from './how-it-works-steps-client';

type Props = { locale: Locale };
type T = (key: string) => string;

function buildProSteps(t: T): StepItem[] {
  return [
    {
      number: '04',
      title: t('howItWorks.steps.pro.4.title'),
      body: t('howItWorks.steps.pro.4.body'),
    },
    {
      number: '03',
      title: t('howItWorks.steps.pro.3.title'),
      body: t('howItWorks.steps.pro.3.body'),
    },
    {
      number: '02',
      title: t('howItWorks.steps.pro.2.title'),
      body: t('howItWorks.steps.pro.2.body'),
    },
    {
      number: '01',
      title: t('howItWorks.steps.pro.1.title'),
      body: t('howItWorks.steps.pro.1.body'),
    },
  ];
}

function buildCustomerSteps(t: T): StepItem[] {
  return [
    {
      number: '04',
      title: t('howItWorks.steps.customer.4.title'),
      body: t('howItWorks.steps.customer.4.body'),
    },
    {
      number: '03',
      title: t('howItWorks.steps.customer.3.title'),
      body: t('howItWorks.steps.customer.3.body'),
    },
    {
      number: '02',
      title: t('howItWorks.steps.customer.2.title'),
      body: t('howItWorks.steps.customer.2.body'),
    },
    {
      number: '01',
      title: t('howItWorks.steps.customer.1.title'),
      body: t('howItWorks.steps.customer.1.body'),
    },
  ];
}

export function HowItWorksSteps({ locale }: Props) {
  const { t } = getTranslations(locale);

  return (
    <section className="bg-step-section-veil relative overflow-clip py-16 xl:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute start-[4px] top-[366px] hidden size-[400px] opacity-60 xl:block dark:opacity-20"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/how-it-works/blob-1.svg" alt="" className="size-full" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute start-[802px] top-[570px] hidden h-[124px] w-[569px] opacity-60 xl:block dark:opacity-20"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/how-it-works/blob-2.svg" alt="" className="size-full" />
      </div>
      <HowItWorksStepsClient
        locale={locale}
        tabPro={t('howItWorks.steps.tabPro')}
        tabCustomer={t('howItWorks.steps.tabCustomer')}
        proHeadline={t('howItWorks.steps.pro.headline')}
        proBody={t('howItWorks.steps.pro.body')}
        customerHeadline={t('howItWorks.steps.customer.headline')}
        customerBody={t('howItWorks.steps.customer.body')}
        proSteps={buildProSteps(t)}
        customerSteps={buildCustomerSteps(t)}
      />
    </section>
  );
}
