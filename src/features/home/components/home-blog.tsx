import Image from 'next/image';
import Link from 'next/link';

import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

export type HomeBlogPost = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  imageSrc: string;
};

type HomeBlogProps = { locale: Locale; posts: HomeBlogPost[] };

const FALLBACK_IMAGE = '/images/blog/featured-1.webp';

type ArticleCardProps = { post: HomeBlogPost; readMoreLabel: string; featured?: boolean };

export function ArticleCard({ post, readMoreLabel, featured = false }: ArticleCardProps) {
  return (
    <Link
      href={ROUTES.BLOG_POST(post.slug)}
      className="group bg-background border-border flex h-full flex-col overflow-hidden rounded-[4px] border transition-shadow duration-200 motion-safe:hover:shadow-md"
    >
      <div
        className={`relative w-full ${featured ? 'aspect-[2732/800] lg:aspect-auto lg:min-h-[260px] lg:flex-1' : 'aspect-[2732/800] shrink-0'}`}
      >
        <Image
          src={post.imageSrc || FALLBACK_IMAGE}
          alt={post.title}
          fill
          className="object-cover"
          sizes={featured ? '(max-width: 1024px) 100vw, 60vw' : '(max-width: 1024px) 100vw, 522px'}
        />
      </div>
      <div dir="rtl" className="flex flex-col gap-2 p-5 text-start sm:p-6">
        <p className="text-brand-navy text-sm font-medium tracking-wide sm:text-[16px]">
          {post.category}
        </p>
        <h3
          className={`text-foreground font-semibold ${featured ? 'text-lg sm:text-[20px]' : 'text-base sm:text-[18px]'}`}
        >
          {post.title}
        </h3>
        {post.summary ? (
          <p className="text-foreground/60 text-sm sm:text-[14px]">{post.summary}</p>
        ) : null}
        <p className="text-brand-navy pt-2 text-sm font-bold group-hover:underline">
          {readMoreLabel}
        </p>
      </div>
    </Link>
  );
}

export function HomeBlog({ locale, posts }: HomeBlogProps) {
  const { t } = getTranslations(locale);
  const readMore = t('home.blog.readMore');
  const featured = posts[0];
  const others = posts.slice(1, 3);

  return (
    <section className="bg-blog-section py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-12">
          <h2 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
            {t('home.blog.headline')}
          </h2>
          <p className="text-muted-foreground max-w-lg text-base">{t('home.blog.subheadline')}</p>
        </div>

        {featured ? (
          <div className="flex flex-col gap-[20px] lg:flex-row">
            <div className="lg:flex-1">
              <ArticleCard post={featured} readMoreLabel={readMore} featured />
            </div>
            {others.length > 0 ? (
              <div className="flex w-full flex-col gap-3 lg:w-[40%] lg:shrink-0 xl:w-[522px]">
                {others.map((post) => (
                  <ArticleCard key={post.slug} post={post} readMoreLabel={readMore} />
                ))}
              </div>
            ) : null}
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
