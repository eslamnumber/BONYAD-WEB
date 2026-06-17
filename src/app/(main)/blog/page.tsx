import { type Metadata } from 'next';

import { JsonLd } from '@/components/seo';
import { env } from '@/config/env';
import {
  BlogFeatured,
  BlogIntro,
  BlogPostsGrid,
  blogToCardVM,
  getBlogs,
  STATIC_ARTICLES,
  staticArticleToCardVM,
  type Blog,
  type BlogCardVM,
} from '@/features/blog';
import { getTranslations, type TFunction } from '@/lib/get-translations';
import { getRequestNonce, getServerLocale } from '@/lib/locale';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { t } = getTranslations(locale);
  const site = env.NEXT_PUBLIC_SITE_URL;

  return {
    title: t('blog.meta.title'),
    description: t('blog.meta.description'),
    alternates: {
      canonical: `${site}/blog`,
      languages: { en: `${site}/blog`, ar: `${site}/blog` },
    },
    openGraph: {
      title: t('blog.meta.title'),
      description: t('blog.meta.description'),
      url: `${site}/blog`,
      type: 'website',
      locale: 'en_SA',
      alternateLocale: 'ar_SA',
    },
    twitter: { card: 'summary_large_image' },
  };
}

function buildJsonLd(cards: BlogCardVM[], t: TFunction, site: string): Record<string, unknown>[] {
  const jsonLd: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: t('blog.meta.title'),
      description: t('blog.meta.description'),
      url: `${site}/blog`,
      inLanguage: ['en', 'ar'],
      isPartOf: { '@type': 'WebSite', name: t('site.name'), url: site },
    },
  ];

  if (cards.length > 0) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: cards.map((card, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: card.title,
        url: `${site}${card.href}`,
      })),
    });
  }

  return jsonLd;
}

export default async function BlogPage() {
  const [locale, nonce, posts] = await Promise.all([
    getServerLocale(),
    getRequestNonce(),
    getBlogs().catch((): Blog[] => []),
  ]);
  const { t } = getTranslations(locale);
  const site = env.NEXT_PUBLIC_SITE_URL;

  // Editorial guides first (mirrors the legacy static blog), then any
  // technician-authored posts the backend returns.
  const cards: BlogCardVM[] = [
    ...STATIC_ARTICLES.map(staticArticleToCardVM),
    ...posts.map((post) => blogToCardVM(post, t)),
  ];

  const featured = cards[0] ?? null;
  const rest = cards.slice(1);

  return (
    <>
      <JsonLd data={buildJsonLd(cards, t, site)} nonce={nonce} />
      <BlogIntro locale={locale} />
      <BlogFeatured locale={locale} card={featured} />
      <BlogPostsGrid locale={locale} cards={rest} />
    </>
  );
}
