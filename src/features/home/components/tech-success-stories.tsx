import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type TechSuccessStoriesProps = { locale: Locale };

type StoryCardProps = { name: string; title: string; quote: string; initials: string };

function StoryCard({ name, title, quote, initials }: StoryCardProps) {
  return (
    <div className="border-border bg-card/60 flex w-full flex-col gap-4 rounded-[8px] border p-6 text-end backdrop-blur-[5px] md:w-[340px] md:shrink-0">
      <p className="text-foreground/80 text-base leading-relaxed">{`"${quote}"`}</p>
      <div className="mt-auto flex items-center gap-3">
        <div
          aria-hidden
          className="bg-brand-navy flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
        >
          {initials}
        </div>
        <div className="flex flex-col text-end">
          <p className="text-foreground text-sm font-semibold">{name}</p>
          <p className="text-muted-foreground text-xs">{title}</p>
        </div>
      </div>
    </div>
  );
}

type StoriesGridProps = { stories: StoryCardProps[] };

function StoriesGrid({ stories }: StoriesGridProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:justify-center">
      {stories.map((story) => (
        <StoryCard key={story.name} {...story} />
      ))}
    </div>
  );
}

function buildStories(t: (k: string) => string): StoryCardProps[] {
  return [
    {
      name: t('tech.successStories.story1Name'),
      title: t('tech.successStories.story1Title'),
      quote: t('tech.successStories.story1Quote'),
      initials: 'AS',
    },
    {
      name: t('tech.successStories.story2Name'),
      title: t('tech.successStories.story2Title'),
      quote: t('tech.successStories.story2Quote'),
      initials: 'MY',
    },
    {
      name: t('tech.successStories.story3Name'),
      title: t('tech.successStories.story3Title'),
      quote: t('tech.successStories.story3Quote'),
      initials: 'SO',
    },
  ];
}

export function TechSuccessStories({ locale }: TechSuccessStoriesProps) {
  const { t } = getTranslations(locale);
  const stories = buildStories(t);

  return (
    <section className="bg-background py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="bg-card relative overflow-hidden rounded-[12px] px-4 py-10 sm:px-8 sm:py-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden items-center justify-center sm:flex"
          >
            <div className="bg-deco-blob-blue-light h-[500px] w-[500px] rounded-full opacity-20 blur-[80px]" />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden items-center justify-center sm:flex"
          >
            <div className="bg-deco-blob-blue-light h-[300px] w-[300px] rounded-full opacity-20 blur-[60px]" />
          </div>
          <div className="relative flex flex-col items-center gap-8 sm:gap-10">
            <div className="flex flex-col items-center gap-3 text-center">
              <h2 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
                {t('tech.successStories.headline')}
              </h2>
              <p className="text-foreground/80 max-w-lg text-base sm:text-lg">
                {t('tech.successStories.subheadline')}
              </p>
            </div>
            <StoriesGrid stories={stories} />
          </div>
        </div>
      </div>
    </section>
  );
}
