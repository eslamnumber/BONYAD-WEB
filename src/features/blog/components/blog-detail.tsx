import Image from 'next/image';
import Link from 'next/link';

import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import type { Blog } from '../schemas/blog';

import { BlogDetailBody } from './blog-detail-body';
import { BlogDetailHeader } from './blog-detail-header';

const FALLBACK_HERO = '/images/blog/featured-1.webp';

type Props = { post: Blog; locale: Locale };

export function BlogDetail({ post, locale }: Props) {
  const { t } = getTranslations(locale);
  const heroImage = post.images?.[0] ?? FALLBACK_HERO;
  const title = post.title ?? t('blog.uncategorized');

  return (
    <article
      aria-labelledby="blog-detail-title"
      className="bg-background mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-12 sm:px-6 md:gap-10 md:py-16 lg:py-20"
    >
      <BlogDetailHeader post={post} locale={locale} />

      <div className="relative aspect-[1280/462] w-full overflow-hidden rounded-[12px]">
        <Image
          src={heroImage}
          alt={t('blog.detail.imageAlt').replace('{{title}}', title)}
          fill
          priority
          sizes="(min-width: 1280px) 1280px, 100vw"
          className="object-cover"
        />
      </div>

      <BlogDetailBody post={post} locale={locale} />

      <div className="text-brand-dark-navy mx-auto mt-4 max-w-[850px] text-end text-base font-semibold">
        <Link
          href={ROUTES.BLOG}
          className="inline-flex items-center gap-2 transition-opacity motion-safe:hover:opacity-80"
        >
          {t('blog.detail.backToBlog')}
        </Link>
      </div>

      <span id="blog-detail-title" className="sr-only">
        {title}
      </span>
    </article>
  );
}
