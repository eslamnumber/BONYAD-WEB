import Link from 'next/link';

import { ROUTES } from '@/config/routes';
import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import type { Blog } from '../schemas/blog';

import { pickBadgeClasses } from './badge-color';

const FALLBACK_IMAGE = '/images/blog/featured-1.webp';

type BlogPostCardProps = { post: Blog; locale: Locale };

export function BlogPostCard({ post, locale }: BlogPostCardProps) {
  const { t } = getTranslations(locale);

  const title = post.title ?? t('blog.uncategorized');
  const summary = post.summary ?? '';
  const tag = post.tags?.[0];
  const badgeLabel = tag ?? t('blog.uncategorized');
  const badgeClasses = pickBadgeClasses(tag);
  const imageSrc = post.images?.[0] ?? FALLBACK_IMAGE;

  return (
    <Link
      href={ROUTES.BLOG_POST(String(post.id))}
      className="group bg-card border-border flex h-full w-full flex-col gap-4 overflow-hidden rounded-[4px] border p-4 transition-shadow duration-200 motion-safe:hover:shadow-sm"
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[2px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageSrc} alt={title} className="absolute inset-0 size-full object-cover" />
      </div>
      <div className="flex w-full flex-1 flex-col items-end gap-4 p-2 text-end">
        <span
          className={`inline-flex items-center justify-center rounded-full px-[10px] py-1 text-base font-bold ${badgeClasses}`}
        >
          {badgeLabel}
        </span>
        <h3 className="text-foreground w-full text-2xl leading-7 font-medium">{title}</h3>
        {summary ? <p className="text-foreground/60 w-full text-base">{summary}</p> : null}
      </div>
    </Link>
  );
}
