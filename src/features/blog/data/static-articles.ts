/**
 * Editorial blog articles ported from the legacy app's static "Latest Blog
 * Posts" section. Each article lives in its own file under ./articles; this
 * module assembles them in display order and exposes a slug lookup. Content is
 * Arabic and rendered as-is in both locales (the hero banners bake in Arabic
 * text). This is local editorial content, not a UI string table.
 */

import { type StaticArticle } from './article-types';
import { anwaDahaatSaudia } from './articles/anwa-dahaat-saudia';
import { marahelBinaManzil } from './articles/marahel-bina-manzil';
import { rokhsatBinaSaudia } from './articles/rokhsat-bina-saudia';
import { tasisTakyefat } from './articles/tasis-takyefat';

export type { ArticleBlock, StaticArticle } from './article-types';

export const STATIC_ARTICLES: StaticArticle[] = [
  marahelBinaManzil,
  rokhsatBinaSaudia,
  anwaDahaatSaudia,
  tasisTakyefat,
];

export function getStaticArticleBySlug(slug: string): StaticArticle | undefined {
  return STATIC_ARTICLES.find((article) => article.slug === slug);
}
