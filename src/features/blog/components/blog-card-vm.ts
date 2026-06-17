import { ROUTES } from '@/config/routes';
import { type TFunction } from '@/lib/get-translations';

import { type StaticArticle } from '../data/static-articles';
import { type Blog } from '../schemas/blog';

/**
 * Neutral card shape so static editorial articles and backend blog posts render
 * through the same card / featured components on the /blog list. Map each
 * source into a `BlogCardVM` and the presentation stays source-agnostic.
 */
export type BlogCardVM = {
  /** Stable list key + link target. */
  href: string;
  title: string;
  summary: string;
  badgeLabel: string;
  /** Raw tag/category fed to the badge-color hash; undefined → default slot. */
  badgeTag?: string;
  imageSrc: string;
};

const FALLBACK_IMAGE = '/images/blog/featured-1.webp';

export function staticArticleToCardVM(article: StaticArticle): BlogCardVM {
  return {
    href: ROUTES.BLOG_POST(article.slug),
    title: article.title,
    summary: article.summary,
    badgeLabel: article.category,
    badgeTag: article.category,
    imageSrc: article.image,
  };
}

export function blogToCardVM(post: Blog, t: TFunction): BlogCardVM {
  const tag = post.tags?.[0];
  return {
    href: ROUTES.BLOG_POST(String(post.id)),
    title: post.title ?? t('blog.uncategorized'),
    summary: post.summary ?? '',
    badgeLabel: tag ?? t('blog.uncategorized'),
    badgeTag: tag,
    imageSrc: post.images?.[0] ?? FALLBACK_IMAGE,
  };
}
