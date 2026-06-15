import { FeatureConnectIcon, FeatureSmoothIcon } from '@/components/icons';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type HomeAboutProps = { locale: Locale };

type LevelCardProps = {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  eyebrow: string;
  title: string;
  body: string;
};

function LevelCard({ Icon, eyebrow, title, body }: LevelCardProps) {
  return (
    <div className="border-step-card-border bg-step-card-bg flex min-h-[200px] w-full flex-col gap-6 rounded-[16px] border p-6 backdrop-blur-[4px] sm:p-8">
      <div aria-hidden className="flex justify-end">
        <Icon className="size-10" />
      </div>
      <div className="flex flex-col gap-3 text-end">
        <span className="text-primary text-sm font-semibold">{eyebrow}</span>
        <h3 className="text-foreground text-xl font-semibold sm:text-2xl">{title}</h3>
        <p className="text-muted-foreground text-base leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

type DerivationProps = { label: string; formula: string; body: string };

function DerivationCard({ label, formula, body }: DerivationProps) {
  return (
    <div className="bg-card flex w-full max-w-[820px] flex-col items-center gap-4 rounded-[16px] px-6 py-8 text-center sm:px-10 sm:py-10">
      <span className="text-primary text-sm font-semibold">{label}</span>
      <p dir="auto" className="text-foreground text-2xl font-semibold sm:text-3xl">
        {formula}
      </p>
      <p dir="auto" className="text-muted-foreground max-w-[640px] text-base leading-relaxed">
        {body}
      </p>
    </div>
  );
}

/**
 * "About Bonyad" — brand explainer rendered on both the customer home and the
 * for-pros home. Content is identical for both audiences (it describes the
 * two-level Bonyad ecosystem), so it reads the shared `home.about` namespace
 * and takes no `variant`. Icons reuse the existing brand feature icons.
 */
export function HomeAbout({ locale }: HomeAboutProps) {
  const { t } = getTranslations(locale);

  return (
    <section className="bg-background py-12 sm:py-16 lg:py-20">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 sm:px-6">
        <div className="flex max-w-[640px] flex-col items-center gap-4 text-center">
          <h2 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
            {t('home.about.heading')}
          </h2>
          <p className="text-primary text-base font-semibold sm:text-lg">
            {t('home.about.tagline')}
          </p>
          <p dir="auto" className="text-foreground/80 text-base sm:text-lg">
            {t('home.about.intro')}
          </p>
        </div>

        <div className="grid w-full gap-4 sm:gap-6 md:grid-cols-2">
          <LevelCard
            Icon={FeatureSmoothIcon}
            eyebrow={t('home.about.level2Eyebrow')}
            title={t('home.about.level2Title')}
            body={t('home.about.level2Body')}
          />
          <LevelCard
            Icon={FeatureConnectIcon}
            eyebrow={t('home.about.level1Eyebrow')}
            title={t('home.about.level1Title')}
            body={t('home.about.level1Body')}
          />
        </div>

        <DerivationCard
          label={t('home.about.derivationLabel')}
          formula={t('home.about.derivationFormula')}
          body={t('home.about.derivationBody')}
        />
      </div>
    </section>
  );
}
