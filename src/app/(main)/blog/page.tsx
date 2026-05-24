import { type Metadata } from 'next';

import { JsonLd } from '@/components/seo';
import { env } from '@/config/env';
import { BlogFeatured, BlogIntro, BlogPostsGrid, getBlogs, type Blog } from '@/features/blog';
import { getTranslations } from '@/lib/get-translations';
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

export default async function BlogPage() {
  const [locale, nonce, posts] = await Promise.all([
    getServerLocale(),
    getRequestNonce(),
    getBlogs().catch((): Blog[] => []),
  ]);
  const { t } = getTranslations(locale);
  const site = env.NEXT_PUBLIC_SITE_URL;

  const featured = posts[0] ?? null;
  const rest = posts.slice(1);

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

  if (posts.length > 0) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: posts.map((post, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: post.title,
        url: `${site}/blog`,
      })),
    });
  }

  return (
    <>
      <JsonLd data={jsonLd} nonce={nonce} />
      <BlogIntro locale={locale} />
      <BlogFeatured locale={locale} post={featured} />
      <BlogPostsGrid locale={locale} posts={rest} />
    </>
  );
}
