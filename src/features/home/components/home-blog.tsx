import Image from 'next/image';
import Link from 'next/link';

import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type HomeBlogProps = { locale: Locale };

type FeaturedPostProps = { category: string; title: string; body: string; readMoreLabel: string };

function FeaturedPost({ category, title, body, readMoreLabel }: FeaturedPostProps) {
  return (
    <Link
      href={ROUTES.BLOG}
      className="group bg-background relative flex-1 overflow-hidden rounded-[4px] transition-shadow duration-200 motion-safe:hover:shadow-md"
    >
      <div className="relative aspect-[16/10] w-full sm:aspect-auto sm:h-[340px]">
        <Image
          src="/images/blog/featured-1.webp"
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="flex flex-col gap-2 p-5 text-end sm:p-6">
        <p className="text-brand-navy text-sm font-medium tracking-wide uppercase sm:text-[16px]">
          {category}
        </p>
        <h3 className="text-foreground text-lg font-semibold sm:text-[20px]">{title}</h3>
        <p className="text-foreground/60 overflow-hidden text-sm sm:text-[14px]">{body}</p>
        <p className="text-brand-navy mt-2 text-sm font-bold group-hover:underline">
          {readMoreLabel}
        </p>
      </div>
    </Link>
  );
}

type OtherPostProps = {
  category: string;
  title: string;
  body: string;
  imgSrc: string;
  readMoreLabel: string;
};

function OtherPost({ category, title, body, imgSrc, readMoreLabel }: OtherPostProps) {
  return (
    <Link
      href={ROUTES.BLOG}
      className="group border-border bg-background flex items-center gap-6 overflow-hidden rounded-[4px] border transition-shadow duration-200 motion-safe:hover:shadow-sm"
    >
      <div className="flex flex-1 flex-col gap-1 px-4 py-3 text-end sm:px-6 sm:py-4">
        <p className="text-brand-navy text-xs font-medium tracking-wide uppercase sm:text-[16px]">
          {category}
        </p>
        <p className="text-foreground text-base font-semibold sm:text-[20px]">{title}</p>
        <p className="text-foreground/60 overflow-hidden text-sm sm:text-[14px]">{body}</p>
        <p className="text-brand-navy mt-1 text-xs font-bold group-hover:underline">
          {readMoreLabel}
        </p>
      </div>
      <div className="relative h-[120px] w-[120px] shrink-0 sm:h-[170px] sm:w-[182px]">
        <Image
          src={imgSrc}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 120px, 182px"
        />
      </div>
    </Link>
  );
}

export function HomeBlog({ locale }: HomeBlogProps) {
  const { t } = getTranslations(locale);
  const readMore = t('home.blog.readMore');

  return (
    <section className="bg-blog-section py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-12">
          <h2 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
            {t('home.blog.headline')}
          </h2>
          <p className="text-muted-foreground max-w-lg text-base">{t('home.blog.subheadline')}</p>
        </div>

        <div className="flex flex-col gap-[20px] md:flex-row">
          <FeaturedPost
            category={t('home.blog.featuredCategory')}
            title={t('home.blog.featuredTitle')}
            body={t('home.blog.featuredBody')}
            readMoreLabel={readMore}
          />
          <div className="flex w-full flex-col gap-3 md:w-[522px] md:shrink-0">
            <OtherPost
              category={t('home.blog.post1Category')}
              title={t('home.blog.post1Title')}
              body={t('home.blog.post1Body')}
              imgSrc="/images/blog/other-1.webp"
              readMoreLabel={readMore}
            />
            <OtherPost
              category={t('home.blog.post2Category')}
              title={t('home.blog.post2Title')}
              body={t('home.blog.post2Body')}
              imgSrc="/images/blog/other-2.webp"
              readMoreLabel={readMore}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
