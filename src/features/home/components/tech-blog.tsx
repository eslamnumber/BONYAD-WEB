import Image from 'next/image';
import Link from 'next/link';

import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

type TechBlogProps = { locale: Locale };

type FeaturedPostProps = { category: string; title: string; body: string; readMoreLabel: string };

function FeaturedPost({ category, title, body, readMoreLabel }: FeaturedPostProps) {
  return (
    <Link
      href={ROUTES.BLOG}
      className="group flex-1 overflow-hidden rounded-[4px] bg-background transition-shadow duration-200 motion-safe:hover:shadow-md"
    >
      <div className="relative h-[340px] w-full">
        <Image
          src="/images/blog/featured-1.webp"
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="flex flex-col gap-2 p-6 text-start">
        <p className="text-[16px] font-medium uppercase tracking-wide text-brand-navy">{category}</p>
        <h3 className="text-[20px] font-semibold text-foreground">{title}</h3>
        <p className="h-[48px] overflow-hidden text-[14px] text-foreground/60">{body}</p>
        <p className="mt-2 text-sm font-bold text-brand-navy group-hover:underline">{readMoreLabel}</p>
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
      className="group flex items-center gap-6 overflow-hidden rounded-[4px] border border-border bg-background transition-shadow duration-200 motion-safe:hover:shadow-sm"
    >
      <div className="flex flex-1 flex-col gap-1 px-6 py-4 text-start">
        <p className="text-[16px] font-medium uppercase tracking-wide text-brand-navy">{category}</p>
        <p className="text-[20px] font-semibold text-foreground">{title}</p>
        <p className="h-[48px] overflow-hidden text-[14px] text-foreground/60">{body}</p>
        <p className="mt-1 text-xs font-bold text-brand-navy group-hover:underline">{readMoreLabel}</p>
      </div>
      <div className="relative h-[170px] w-[182px] shrink-0">
        <Image src={imgSrc} alt={title} fill className="object-cover" sizes="182px" />
      </div>
    </Link>
  );
}

export function TechBlog({ locale }: TechBlogProps) {
  const { t } = getTranslations(locale);
  const readMore = t('tech.blog.readMore');

  return (
    <section className="bg-blog-section py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <h2 className="text-4xl font-medium tracking-tight text-foreground md:text-5xl">
            {t('tech.blog.headline')}
          </h2>
          <p className="max-w-lg text-base text-muted-foreground">{t('tech.blog.subheadline')}</p>
        </div>

        {/* Reversed layout: 3 posts on start, featured on end */}
        <div className="flex flex-col gap-[20px] md:flex-row">
          <div className="flex w-full flex-col gap-3 md:w-[522px] md:shrink-0">
            <OtherPost
              category={t('tech.blog.post1Category')}
              title={t('tech.blog.post1Title')}
              body={t('tech.blog.post1Body')}
              imgSrc="/images/blog/other-1.webp"
              readMoreLabel={readMore}
            />
            <OtherPost
              category={t('tech.blog.post2Category')}
              title={t('tech.blog.post2Title')}
              body={t('tech.blog.post2Body')}
              imgSrc="/images/blog/other-2.webp"
              readMoreLabel={readMore}
            />
            <OtherPost
              category={t('tech.blog.post3Category')}
              title={t('tech.blog.post3Title')}
              body={t('tech.blog.post3Body')}
              imgSrc="/images/blog/other-1.webp"
              readMoreLabel={readMore}
            />
          </div>
          <FeaturedPost
            category={t('tech.blog.featuredCategory')}
            title={t('tech.blog.featuredTitle')}
            body={t('tech.blog.featuredBody')}
            readMoreLabel={readMore}
          />
        </div>
      </div>
    </section>
  );
}
