/**
 * Shared types + constants for the editorial blog articles ported from the
 * legacy app. Content is authored in Arabic and rendered as-is in both locales.
 * One article per file under ./articles, assembled in ./static-articles.
 */

export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'list'; items: string[] };

export type StaticArticle = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  author: string;
  date: string;
  image: string;
  body: ArticleBlock[];
};

export const ARTICLE_AUTHOR = 'فريق بُنياد';
export const ARTICLE_YEAR = '2026';
