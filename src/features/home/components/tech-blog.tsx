import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import { ArticleCard, type HomeBlogPost } from './home-blog';

type TechBlogProps = { locale: Locale; posts: HomeBlogPost[] };

export function TechBlog({ locale, posts }: TechBlogProps) {
  const { t } = getTranslations(locale);
  const readMore = t('tech.blog.readMore');
  const featured = posts[0];
  const others = posts.slice(1, 4);

  return (
    <section className="bg-blog-section py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-12">
          <h2 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
            {t('tech.blog.headline')}
          </h2>
          <p className="text-muted-foreground max-w-lg text-base">{t('tech.blog.subheadline')}</p>
        </div>

        {featured ? (
          // Reversed layout: cards on the start, featured on the end.
          <div className="flex flex-col gap-[20px] lg:flex-row">
            {others.length > 0 ? (
              <div className="flex w-full flex-col gap-3 lg:w-[40%] lg:shrink-0 xl:w-[522px]">
                {others.map((post) => (
                  <ArticleCard key={post.slug} post={post} readMoreLabel={readMore} />
                ))}
              </div>
            ) : null}
            <div className="lg:flex-1">
              <ArticleCard post={featured} readMoreLabel={readMore} featured />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-foreground text-xl font-semibold">{t('blog.empty.title')}</p>
            <p className="text-muted-foreground mt-2">{t('blog.empty.body')}</p>
          </div>
        )}
      </div>
    </section>
  );
}
