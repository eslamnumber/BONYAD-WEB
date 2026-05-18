import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type TechSuccessStoriesProps = { locale: Locale };

type StoryCardProps = { name: string; title: string; quote: string; initials: string };

function StoryCard({ name, title, quote, initials }: StoryCardProps) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-[8px] border border-[#dbdbdb] bg-white/60 p-6 text-start backdrop-blur-[5px] md:w-[340px] md:shrink-0">
      <p className="text-base leading-relaxed text-foreground/80">{`"${quote}"`}</p>
      <div className="mt-auto flex items-center gap-3">
        <div aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-semibold text-white">
          {initials}
        </div>
        <div className="flex flex-col text-start">
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
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

export function TechSuccessStories({ locale }: TechSuccessStoriesProps) {
  const { t } = getTranslations(locale);

  const stories: StoryCardProps[] = [
    { name: t('tech.successStories.story1Name'), title: t('tech.successStories.story1Title'), quote: t('tech.successStories.story1Quote'), initials: 'AS' },
    { name: t('tech.successStories.story2Name'), title: t('tech.successStories.story2Title'), quote: t('tech.successStories.story2Quote'), initials: 'MY' },
    { name: t('tech.successStories.story3Name'), title: t('tech.successStories.story3Title'), quote: t('tech.successStories.story3Quote'), initials: 'SO' },
  ];

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[12px] bg-white py-12">
          <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[500px] w-[500px] rounded-full bg-deco-blob-blue-light opacity-20 blur-[80px]" />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[300px] w-[300px] rounded-full bg-deco-blob-blue-light opacity-20 blur-[60px]" />
          </div>
          <div className="relative flex flex-col items-center gap-10 px-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <h2 className="text-4xl font-medium tracking-tight text-foreground md:text-5xl">
                {t('tech.successStories.headline')}
              </h2>
              <p className="max-w-lg text-lg text-foreground/80">{t('tech.successStories.subheadline')}</p>
            </div>
            <StoriesGrid stories={stories} />
          </div>
        </div>
      </div>
    </section>
  );
}
