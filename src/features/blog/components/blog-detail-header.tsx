import { getTranslations } from '@/lib/get-translations';
import { type Locale } from '@/types/locale';

import type { Blog } from '../schemas/blog';

import { BlogAuthorChip } from './blog-author-chip';

type Props = { post: Blog; locale: Locale };

function formatDate(iso: string | undefined, locale: Locale): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getAvatarUrl(post: Blog): string | undefined {
  const author = post.author as
    | (typeof post.author & { avatar?: string; image?: string })
    | undefined;
  return author?.avatar ?? author?.image;
}

export function BlogDetailHeader({ post, locale }: Props) {
  const { t } = getTranslations(locale);
  const tag = post.tags?.[0];
  const badgeLabel = tag ?? t('blog.uncategorized');
  const title = post.title ?? t('blog.uncategorized');
  const dateText = formatDate(post.publishedAt ?? post.createdAt, locale);

  return (
    <header className="mx-auto flex w-full max-w-[800px] flex-col items-end gap-5">
      <div className="flex w-full flex-col items-end gap-4">
        <span className="bg-brand-dark-navy/10 text-brand-dark-navy inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm leading-5 font-bold">
          {badgeLabel}
        </span>
        <h1 className="text-brand-dark-navy w-full text-end text-3xl leading-tight font-semibold sm:text-4xl lg:text-[45px]">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-6">
        {dateText && (
          <time
            dateTime={post.publishedAt ?? post.createdAt}
            className="text-muted-foreground text-sm leading-5"
          >
            {dateText}
          </time>
        )}
        {post.author?.name && (
          <BlogAuthorChip
            author={post.author}
            avatarUrl={getAvatarUrl(post)}
            avatarFallback={t('blog.detail.avatarFallback')}
          />
        )}
      </div>
    </header>
  );
}
